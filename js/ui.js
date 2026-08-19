import { getEvents, getVendors } from "./api.js";
import {
  setSearch,
  setVendor,
  setSort,
  setDiscovered,
  setFlag,
  getFilters,
  resetFilters,
  readFiltersFromUrl,
  filtersToUrl,
} from "./app.js";
import { initTheme } from "./theme.js";
import { matchesQuery, confidenceTier, countByVendor } from "./utils.js";
import { renderSiteHeader, bindThemeToggleBehavior } from "./components/site-header.js";
import { renderSiteFooter } from "./components/site-footer.js";
import { renderHero } from "./components/hero.js";
import { renderFilterBar } from "./components/filter-bar.js";
import { renderOpportunityCard } from "./components/opportunity-card.js";
import { renderPaginationHtml, paginationState } from "./components/pagination.js";
import { renderSkeletonGrid, renderEmptyState, renderErrorState, renderResultsCount } from "./components/feed-state.js";
import { renderHowItWorks } from "./components/how-it-works.js";
import { renderNotificationCta } from "./components/notification-cta.js";
import { renderNotificationsPage } from "./pages/notifications-page.js";
import {
  renderAboutPage,
  renderPrivacyPage,
  renderTermsPage,
  renderDisclaimerPage,
  renderDiscordPrivacyPage,
  renderDiscordTermsPage,
  renderDiscordDisclaimerPage,
  renderDiscordPermissionsPage,
  renderTelegramPrivacyPage,
  renderTelegramTermsPage,
  renderTelegramDisclaimerPage,
} from "./pages/legal-pages.js";

let events = [];
let currentPage = 1;
let pageWindowStart = 1;
let nextCursor = null;
let isLoadingMore = false;
let isFetching = false;

const CLIENT_SIZE = 6;
const WINDOW_SIZE = 5;
const queryCache = new Map();

/* ── State helpers ── */

function sortByCreatedAt(list) {
  const dir = getFilters().sort === "oldest" ? 1 : -1;
  return [...list].sort((a, b) => {
    const aTime = a?.created_at ? Date.parse(a.created_at) : 0;
    const bTime = b?.created_at ? Date.parse(b.created_at) : 0;
    return (aTime - bTime) * dir;
  });
}

function cacheKey() {
  const f = getFilters();
  return `${f.vendor}|${f.discovered}|${f.flag}`;
}

function saveCache() {
  queryCache.set(cacheKey(), { events: [...events], nextCursor });
}

function htmlToEl(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/* Some builders emit multiple sibling elements (skip-link + header, etc.);
 * append every parsed node instead of just the first. */
function appendHtml(parent, html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  parent.append(...t.content.children);
}

function swapNodes(selector, html) {
  const existing = document.querySelector(selector);
  if (!existing) return null;
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  const nodes = [...t.content.children];
  existing.replaceWith(...nodes);
  return nodes.length === 1 ? nodes[0] : nodes.find((n) => n.matches("form,[data-filter-bar]")) || null;
}

function visibleEvents() {
  const f = getFilters();
  let list = events;

  if (f.search) {
    list = list.filter((e) => matchesQuery(e, f.search));
  }

  if (f.discovered !== "any") {
    const days = f.discovered === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 86400000;
    list = list.filter((e) => e.created_at && Date.parse(e.created_at) >= cutoff);
  }

  if (f.flag !== "any") {
    list = list.filter((e) => confidenceTier(e.ai_result?.confidence)?.key === f.flag);
  }

  return sortByCreatedAt(list);
}

function isLocalFilterActive() {
  const f = getFilters();
  return Boolean(f.search) || f.discovered !== "any" || f.flag !== "any" || f.vendor !== "all";
}

function syncUrlToFilters() {
  try {
    history.replaceState(null, "", filtersToUrl(getFilters()));
  } catch (e) {}
}

/* ── Home shell ── */

function homeShellHtml(vendors) {
  return `
    ${renderSiteHeader()}
    ${renderHero(vendors)}
    <div class="container">
      <div data-filter-slot></div>
      <section class="feed-section" id="feed" aria-label="Latest certification opportunities" tabindex="-1">
        <div class="feed-head">
          <h2 class="section-heading">Latest opportunities</h2>
          <span class="results-count" id="results-count" aria-live="polite"></span>
        </div>
        <div id="feed-status"></div>
        <nav class="pagination" id="pagination" aria-label="Listings pages"></nav>
      </section>
    </div>
    ${renderHowItWorks()}
    ${renderNotificationCta()}
    ${renderSiteFooter()}
  `;
}

function buildHomeShell(vendors) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  appendHtml(app, homeShellHtml(vendors));
  const slot = document.querySelector("[data-filter-slot]");
  if (slot) slot.appendChild(htmlToEl(renderFilterBar(vendors)));
  bindHomeShell();
}

function bindHomeShell() {
  bindThemeToggleBehavior();
  bindSearchForm();
  bindFilterBar();
  document.getElementById("pagination").addEventListener("click", onPaginationClick);

  document.getElementById("feed-status").addEventListener("click", (e) => {
    if (e.target.closest("[data-empty-clear]")) clearAllFilters();
    if (e.target.closest("#retry-btn")) loadFeed(true);
  });
}

function bindSearchForm() {
  const form = document.querySelector("[data-search-form]");
  if (!form) return;
  const input = form.querySelector(".search-input");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    setSearch(input.value);
    window.dispatchEvent(new CustomEvent("filterchange"));
  });
  let debounceTimer = null;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const value = input.value;
    debounceTimer = setTimeout(() => {
      if (getFilters().search === value) return;
      setSearch(value);
      window.dispatchEvent(new CustomEvent("filterchange"));
    }, 250);
  });
}

function bindFilterBar() {
  const bar = document.querySelector("[data-filter-bar]");
  if (!bar) return;
  bar.querySelector("[data-filter-vendor]").addEventListener("change", (e) => setVendor(e.target.value));
  bar.querySelector("[data-filter-discovered]").addEventListener("change", (e) => setDiscovered(e.target.value));
  bar.querySelector("[data-filter-flag]").addEventListener("change", (e) => setFlag(e.target.value));
  bar.querySelector("[data-filter-sort]").addEventListener("change", (e) => setSort(e.target.value));
  bar.querySelector("[data-filter-clear]").addEventListener("click", clearAllFilters);
}

function syncFilterControls() {
  const f = getFilters();
  const map = {
    "[data-filter-vendor]": f.vendor,
    "[data-filter-discovered]": f.discovered,
    "[data-filter-flag]": f.flag,
    "[data-filter-sort]": f.sort,
  };
  for (const [sel2, value] of Object.entries(map)) {
    const el = document.querySelector(sel2);
    if (!el) continue;
    if (sel2 === "[data-filter-vendor]" && el.options.length) {
      const wanted = String(value || "all").toLowerCase();
      const opt = [...el.options].find((o) => o.value.toLowerCase() === wanted);
      el.value = opt ? opt.value : "all";
    } else {
      el.value = value;
    }
  }
  const search = document.querySelector("[data-search-form] .search-input");
  if (search) search.value = f.search;
  updateClearVisibility();
}

function updateClearVisibility() {
  const clearBtn = document.querySelector("[data-filter-clear]");
  if (clearBtn) clearBtn.classList.toggle("hidden", !isLocalFilterActive());
}

function clearAllFilters() {
  resetFilters();
  syncFilterControls();
}

/* ── Feed painting ── */

function paintSkeletons() {
  document.getElementById("results-count").textContent = "Loading…";
  document.getElementById("pagination").innerHTML = "";
  document.getElementById("feed-status").innerHTML = renderSkeletonGrid(6);
  document.getElementById("feed").setAttribute("aria-busy", "true");
}

function paintError(message) {
  document.getElementById("feed").removeAttribute("aria-busy");
  document.getElementById("results-count").textContent = "";
  document.getElementById("pagination").innerHTML = "";
  document.getElementById("feed-status").innerHTML = renderErrorState(message);
}

function paintFeed() {
  syncFilterControls();
  const list = visibleEvents();

  document.getElementById("feed").removeAttribute("aria-busy");

  const totalPages = Math.ceil(list.length / CLIENT_SIZE);
  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

  const start = (currentPage - 1) * CLIENT_SIZE;
  const pageEvents = list.slice(start, start + CLIENT_SIZE);

  document.getElementById("results-count").textContent =
    list.length === events.length
      ? renderResultsCount(list.length)
      : `${list.length} of ${events.length} listings`;

  if (!pageEvents.length) {
    document.getElementById("pagination").innerHTML = "";
    document.getElementById("feed-status").innerHTML = renderEmptyState();
    updateClearVisibility();
    syncUrlToFilters();
    return;
  }

  const grid = document.createElement("div");
  grid.className = "card-grid";
  const fragment = document.createDocumentFragment();
  for (const event of pageEvents) {
    fragment.appendChild(htmlToEl(renderOpportunityCard(event)));
  }
  grid.appendChild(fragment);

  const status = document.getElementById("feed-status");
  status.innerHTML = "";
  status.appendChild(grid);

  const state = paginationState(list.length, nextCursor, currentPage, pageWindowStart, CLIENT_SIZE, WINDOW_SIZE);
  document.getElementById("pagination").innerHTML = renderPaginationHtml(state);
  updateClearVisibility();
  syncUrlToFilters();
}

/* ── Filter change pipeline ──
 * Controls update state in app.js and dispatch "filterchange".
 * This listener is the single trigger that repaints the feed.
 * loadFeed(true) serves from the query cache when only local filters
 * (search / discovered / flag) changed, so those updates are instant. */

let pendingReload = false;

function onFiltersChanged() {
  currentPage = 1;
  pageWindowStart = 1;
  if (!isHomeRendered()) return;
  loadFeed(true);
}

window.addEventListener("filterchange", onFiltersChanged);

/* ── Data fetching ── */

async function loadFeed(reset) {
  if (isFetching) {
    if (reset) pendingReload = true;
    return;
  }
  isFetching = true;

  if (reset) {
    const cached = queryCache.get(cacheKey());
    if (cached) {
      events = [...cached.events];
      nextCursor = cached.nextCursor;
      currentPage = 1;
      pageWindowStart = 1;
      paintFeed();
      isFetching = false;
      return;
    }
    paintSkeletons();
  }

  try {
    const filters = getFilters();
    let vendorParam = filters.vendor;
    if (vendorParam && vendorParam !== "all") {
      try {
        const known = await getVendors();
        const match = known?.find((v) => v.vendor.toLowerCase() === vendorParam.toLowerCase());
        if (match) vendorParam = match.vendor;
      } catch (e) {}
    }
    const { events: newEvents, nextCursor: nc } = await getEvents({
      vendor: vendorParam,
      sort: filters.sort,
      cursor: reset ? null : undefined,
    });

    if (reset) {
      events = newEvents;
      nextCursor = nc;
      currentPage = 1;
      pageWindowStart = 1;
    }
    saveCache();
    paintFeed();
  } catch (err) {
    console.error("Failed to fetch listings:", err);
    if (reset) paintError("Failed to load vouchers. Please check your connection and try again.");
  } finally {
    isFetching = false;
    if (pendingReload) {
      pendingReload = false;
      loadFeed(true);
    }
  }
}

async function loadMore() {
  if (isLoadingMore) return;
  isLoadingMore = true;

  const btn = document.getElementById("load-more-btn");
  const status = showLoadMoreStatus();
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "Loading…";
  }

  try {
    const filters = getFilters();
    const { events: newEvents, nextCursor: nc } = await getEvents({
      vendor: filters.vendor,
      sort: filters.sort,
      cursor: nextCursor,
    });

    events = events.concat(newEvents);
    nextCursor = nc;
    const total = visibleEvents().length;
    currentPage = Math.max(1, Math.ceil(total / CLIENT_SIZE));
    pageWindowStart = Math.floor((currentPage - 1) / WINDOW_SIZE) * WINDOW_SIZE + 1;
    saveCache();

    clearLoadMoreStatus();
    paintFeed();
  } catch (err) {
    console.error("Failed to load more:", err);
    status.textContent = "Failed to load more items.";
    const retryBtn = document.createElement("button");
    retryBtn.className = "page-btn load-more-retry";
    retryBtn.textContent = "Retry";
    retryBtn.addEventListener("click", () => {
      clearLoadMoreStatus();
      loadMore();
    });
    status.appendChild(retryBtn);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "Next &rarr;";
    }
  } finally {
    isLoadingMore = false;
  }
}

function showLoadMoreStatus() {
  clearLoadMoreStatus();
  const el = htmlToEl(`
    <div class="load-more-status" id="load-more-status" role="status">
      <span class="spinner" aria-hidden="true"></span>
      <span>Loading more listings…</span>
    </div>
  `);
  document.getElementById("pagination").insertAdjacentElement("afterend", el);
  return el;
}

function clearLoadMoreStatus() {
  const existing = document.getElementById("load-more-status");
  if (existing) existing.remove();
}

/* ── Pagination interactions ── */

function onPaginationClick(e) {
  const btn = e.target.closest("[data-page-action]");
  if (!btn || btn.disabled) return;

  const action = btn.dataset.pageAction;
  const total = Math.ceil(visibleEvents().length / CLIENT_SIZE);

  switch (action) {
    case "goto":
      currentPage = Number(btn.dataset.page);
      break;
    case "prev":
      if (currentPage > 1) currentPage--;
      break;
    case "next":
      if (currentPage < total) currentPage++;
      break;
    case "first":
      currentPage = 1;
      break;
    case "window-forward":
      pageWindowStart = Math.min(pageWindowStart + WINDOW_SIZE, Math.max(total, 1));
      currentPage = Math.min(Math.max(pageWindowStart, 1), total || 1);
      break;
    case "more":
      loadMore();
      return;
  }

  if (currentPage < pageWindowStart) {
    pageWindowStart = Math.max(1, pageWindowStart - WINDOW_SIZE);
  } else if (currentPage > pageWindowStart + WINDOW_SIZE - 1) {
    pageWindowStart = Math.min(pageWindowStart + WINDOW_SIZE, Math.max(total, 1));
  }

  paintFeed();
  document.getElementById("feed").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── Router ── */

const PAGE_ROUTES = {
  about: renderAboutPage,
  privacy: renderPrivacyPage,
  terms: renderTermsPage,
  disclaimer: renderDisclaimerPage,
  notifications: renderNotificationsPage,
  "discord/privacy": renderDiscordPrivacyPage,
  "discord/terms": renderDiscordTermsPage,
  "discord/disclaimer": renderDiscordDisclaimerPage,
  "discord/permissions": renderDiscordPermissionsPage,
  "telegram/privacy": renderTelegramPrivacyPage,
  "telegram/terms": renderTelegramTermsPage,
  "telegram/disclaimer": renderTelegramDisclaimerPage,
};

function renderLegalRoute(hash) {
  const renderFn = PAGE_ROUTES[hash];
  if (!renderFn) return false;

  const app = document.getElementById("app");
  app.innerHTML = "";
  window.scrollTo(0, 0);

  app.appendChild(htmlToEl(renderSiteHeader()));

  const main = htmlToEl('<main class="container"></main>');
  const content = renderFn();
  if (typeof content === "string") {
    main.innerHTML = content;
  } else {
    main.appendChild(content);
  }
  app.appendChild(main);

  app.appendChild(htmlToEl(renderSiteFooter()));
  bindThemeToggleBehavior();
  return true;
}

function isHomeRendered() {
  return Boolean(document.getElementById("feed"));
}

async function ensureHomeRendered() {
  if (isHomeRendered()) return;
  buildHomeShell(null);
  await loadFeed(true);
  populateVendorData();
}

let vendorsLoaded = false;

async function populateVendorData() {
  if (vendorsLoaded) return;
  vendorsLoaded = true;
  try {
    const vendors = await getVendors();

    if (!document.querySelector(".vendor-chips")) {
      const hero = document.querySelector(".hero");
      if (hero) {
        const searchValue = document.querySelector("[data-search-form] .search-input")?.value ?? "";
        const fresh = htmlToEl(renderHero(vendors, countByVendor(events)));
        hero.replaceWith(fresh);
        const input = fresh.querySelector(".search-input");
        if (input) input.value = searchValue;
        bindSearchForm();
      }
    }

    const select = document.querySelector("[data-filter-vendor]");
    if (select && select.options.length <= 1) {
      for (const v of vendors) {
        const opt = document.createElement("option");
        opt.value = v.vendor;
        opt.textContent = v.vendor.replace(/\b\w/g, (c) => c.toUpperCase());
        select.appendChild(opt);
      }
      select.value = getFilters().vendor;
    }
  } catch (err) {
    console.error("Failed to load vendors:", err);
    vendorsLoaded = false;
  }
}

window.addEventListener("hashchange", async () => {
  const hash = location.hash.replace("#", "");
  if (!hash || hash === "home") {
    await navigateHome();
    window.scrollTo(0, 0);
    return;
  }
  if (PAGE_ROUTES[hash]) {
    renderLegalRoute(hash);
    return;
  }
  if (hash === "how-it-works") {
    await ensureHomeRendered();
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  }
});

/* ── Server-rendered enhancement ── */


function enhanceServerRendered(initial) {
  events = initial.events;
  nextCursor = initial.nextCursor ?? null;
  currentPage = 1;
  pageWindowStart = 1;
  readFiltersFromUrl(location.search);

  /* Cache only when URL params don't request a server-side subset,
   * otherwise this unfiltered payload would poison the cache key. */
  const f = getFilters();
  if (f.vendor === "all") saveCache();

  swapNodes(".site-header", renderSiteHeader());
  swapNodes(".hero", renderHero(initial.vendors, countByVendor(events)));
  swapNodes("[data-filter-bar]", renderFilterBar(initial.vendors));

  bindHomeShell();
  /* Always resolve through loadFeed: with default filters it serves the
   * adopted payload from cache instantly; with ?vendor=/&sort= params it
   * fetches the correct server-filtered subset. */
  loadFeed(true);
}

async function navigateHome() {
  await ensureHomeRendered();
  await loadFeed(true);
}

/* ── Bootstrap ── */

async function init() {
  initTheme();

  const hash = location.hash.replace("#", "");
  if (hash && PAGE_ROUTES[hash]) {
    renderLegalRoute(hash);
    return;
  }

  const initial = window.__INITIAL_DATA__;
  if (
    initial &&
    initial.ok !== false &&
    Array.isArray(initial.events) &&
    document.getElementById("card-grid")
  ) {
    enhanceServerRendered(initial);
    return;
  }

  readFiltersFromUrl(location.search);
  buildHomeShell(null);
  paintSkeletons();
  await loadFeed(true);
  populateVendorData();
}

init();
