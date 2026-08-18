import { getEvents, getVendors } from "./api.js";
import { setSearch, setVendor, setSort, getFilters, clearSearch } from "./app.js";
import { initTheme, toggleTheme, getCurrentTheme } from "./theme.js";
import { ICONS } from "./components/icons.js";
import { renderSiteHeader } from "./components/site-header.js";
import { renderSiteFooter } from "./components/site-footer.js";
import { renderHero } from "./components/hero.js";
import { renderFilterBar } from "./components/filter-bar.js";
import { renderOpportunityCard } from "./components/opportunity-card.js";
import { renderPaginationHtml, paginationState, isFilterActive } from "./components/pagination.js";
import { renderSkeletonGrid, renderEmptyState, renderErrorState, renderResultsCount } from "./components/feed-state.js";
import { renderHowItWorks } from "./components/how-it-works.js";
import { renderNotificationCta } from "./components/notification-cta.js";
import {
  renderAboutPage,
  renderPrivacyPage,
  renderTermsPage,
  renderDisclaimerPage,
  renderNotificationsPage,
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
  return `${f.search}|${f.vendor}|${f.sort}`;
}

function saveCache() {
  queryCache.set(cacheKey(), { events: [...events], nextCursor });
}

function htmlToEl(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/* ── Home shell ── */

function homeShellHtml(vendors) {
  return `
    ${renderSiteHeader()}
    ${renderHero(vendors)}
    <div class="container">
      <div data-filter-slot></div>
      <section class="feed-section" id="feed" aria-label="Latest certification opportunities">
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
  app.appendChild(htmlToEl(homeShellHtml(vendors)));
  document.querySelector("[data-filter-slot]").appendChild(htmlToEl(renderFilterBar(vendors)));
  bindHomeShell();
}

function bindHomeShell() {
  bindThemeToggle();

  const form = document.querySelector("[data-search-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = form.querySelector(".search-input").value;
      setSearch(value);
      window.dispatchEvent(new CustomEvent("filterchange"));
    });
  }

  const chips = document.querySelector(".vendor-chips");
  if (chips) {
    chips.addEventListener("click", (e) => {
      const chip = e.target.closest(".vendor-chip");
      if (!chip) return;
      setVendor(chip.dataset.vendor);
      syncFilterControls();
    });
  }

  const bar = document.querySelector("[data-filter-bar]");
  if (bar) {
    bar.querySelector("[data-filter-vendor]").addEventListener("change", (e) => {
      setVendor(e.target.value);
      syncFilterControls();
    });
    bar.querySelector("[data-filter-sort]").addEventListener("change", (e) => setSort(e.target.value));
    bar.querySelector("[data-filter-clear]").addEventListener("click", clearAllFilters);
  }

  document.getElementById("pagination").addEventListener("click", onPaginationClick);

  const feedStatus = document.getElementById("feed-status");
  feedStatus.addEventListener("click", (e) => {
    if (e.target.closest("[data-empty-clear]")) clearAllFilters();
    if (e.target.closest("#retry-btn")) loadFeed(true);
  });
}

function syncFilterControls() {
  const select = document.querySelector("[data-filter-vendor]");
  if (select) select.value = getFilters().vendor;
  const search = document.querySelector("[data-search-form] .search-input");
  if (search) search.value = getFilters().search;
  updateClearVisibility();
}

function updateClearVisibility() {
  const clearBtn = document.querySelector("[data-filter-clear]");
  if (clearBtn) clearBtn.classList.toggle("hidden", !isFilterActive());
}

function clearAllFilters() {
  setSearch("");
  setVendor("all");
  syncFilterControls();
  window.dispatchEvent(new CustomEvent("filterchange"));
}

/* ── Theme toggle ── */

function themeIconFor(theme) {
  return theme === "dark" ? ICONS.sun : ICONS.moon;
}

function bindThemeToggle() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  btn.innerHTML = themeIconFor(getCurrentTheme());
  btn.addEventListener("click", () => {
    toggleTheme();
    btn.innerHTML = themeIconFor(getCurrentTheme());
  });
}

/* ── Feed painting ── */

function paintSkeletons() {
  document.getElementById("results-count").textContent = "Loading…";
  document.getElementById("pagination").innerHTML = "";
  document.getElementById("feed-status").innerHTML = renderSkeletonGrid(6);
  document.getElementById("feed").setAttribute("aria-busy", "true");
}

function paintError(message) {
  const feed = document.getElementById("feed");
  feed.removeAttribute("aria-busy");
  document.getElementById("results-count").textContent = "";
  document.getElementById("pagination").innerHTML = "";
  document.getElementById("feed-status").innerHTML = renderErrorState(message);
}

function paintFeed() {
  const grid = document.createElement("div");
  grid.className = "card-grid";

  const start = (currentPage - 1) * CLIENT_SIZE;
  const pageEvents = events.slice(start, start + CLIENT_SIZE);

  if (!pageEvents.length) {
    document.getElementById("feed").removeAttribute("aria-busy");
    document.getElementById("results-count").textContent = renderResultsCount(events.length);
    document.getElementById("pagination").innerHTML = "";
    document.getElementById("feed-status").innerHTML = events.length ? "" : renderEmptyState();
    updateClearVisibility();
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const event of pageEvents) {
    fragment.appendChild(htmlToEl(renderOpportunityCard(event)));
  }
  grid.appendChild(fragment);

  const status = document.getElementById("feed-status");
  status.innerHTML = "";
  status.appendChild(grid);

  document.getElementById("feed").removeAttribute("aria-busy");
  document.getElementById("results-count").textContent = renderResultsCount(events.length);

  const state = paginationState(events, nextCursor, currentPage, pageWindowStart, CLIENT_SIZE, WINDOW_SIZE);
  document.getElementById("pagination").innerHTML = renderPaginationHtml(state);
  updateClearVisibility();
}

/* ── Data fetching ── */

async function loadFeed(reset) {
  if (isFetching) return;
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
    const { events: newEvents, nextCursor: nc } = await getEvents({
      ...filters,
      cursor: reset ? null : undefined,
    });

    if (reset) {
      events = sortByCreatedAt(newEvents);
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
    const { events: newEvents, nextCursor: nc } = await getEvents({ ...filters, cursor: nextCursor });

    events = sortByCreatedAt(events.concat(newEvents));
    nextCursor = nc;
    currentPage = Math.ceil(events.length / CLIENT_SIZE);
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
    <div class="load-more-status" id="load-more-status">
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
  const state = paginationState(events, nextCursor, currentPage, pageWindowStart, CLIENT_SIZE, WINDOW_SIZE);
  const total = state.totalPages;

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
  app.appendChild(htmlToEl(`<main class="container">${renderFn()}</main>`));
  app.appendChild(htmlToEl(renderSiteFooter()));
  bindThemeToggle();
  return true;
}

function isHomeRendered() {
  return Boolean(document.getElementById("feed"));
}

async function navigateHome() {
  if (!isHomeRendered()) {
    buildHomeShell(null);
    populateVendorData();
  }
  await loadFeed(true);
}

let vendorsLoaded = false;

async function populateVendorData() {
  if (vendorsLoaded) return;
  vendorsLoaded = true;
  try {
    const vendors = await getVendors();
    const slot = document.querySelector(".vendor-chips");
    const select = document.querySelector("[data-filter-vendor]");
    if (slot && !slot.children.length) {
      for (const v of vendors) {
        const chip = htmlToEl(`<button type="button" class="vendor-chip" data-vendor="${v.vendor}"></button>`);
        chip.textContent = v.vendor.replace(/\b\w/g, (c) => c.toUpperCase());
        slot.appendChild(chip);
      }
    }
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

window.addEventListener("hashchange", () => {
  const hash = location.hash.replace("#", "");
  if (!hash || hash === "home") {
    navigateHome();
    window.scrollTo(0, 0);
    return;
  }
  if (PAGE_ROUTES[hash]) {
    renderLegalRoute(hash);
    return;
  }
  if (hash === "how-it-works") {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  }
});

/* ── Server-rendered enhancement ── */

function swapNode(selector, html) {
  const existing = document.querySelector(selector);
  if (!existing) return null;
  const fresh = htmlToEl(html);
  existing.replaceWith(fresh);
  return fresh;
}

function enhanceServerRendered(initial) {
  events = sortByCreatedAt(initial.events);
  nextCursor = initial.nextCursor ?? null;
  currentPage = 1;
  pageWindowStart = 1;
  saveCache();

  swapNode(".site-header", renderSiteHeader());
  swapNode(".hero", renderHero(initial.vendors));
  swapNode("[data-filter-bar]", renderFilterBar(initial.vendors));

  bindHomeShell();
  paintFeed();
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

  buildHomeShell(null);
  paintSkeletons();
  populateVendorData();
  await loadFeed(true);
}

init();
