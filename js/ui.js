import { renderVoucherCard, capitalize } from "./voucher-card.js";
import { getEvents, getVendors } from "./api.js";
import { setSearch, setVendor, setSort, getFilters, submitSearch, clearSearch } from "./app.js";
import { showWelcomeModal } from "./welcome-modal.js";
import { initTheme, toggleTheme, getCurrentTheme } from "./theme.js";
import { renderAboutPage, renderPrivacyPage, renderTermsPage, renderDisclaimerPage, renderFooter } from "./pages.js";

let events = [];
let currentPage = 1;
let pageWindowStart = 1;
let nextCursor = null;
let isLoadingMore = false;
let isFetching = false;

const CLIENT_SIZE = 6;
const WINDOW_SIZE = 5;
const queryCache = new Map();

function cacheKey() {
  const f = getFilters();
  return `${f.search}|${f.vendor}|${f.sort}`;
}

function saveCache() {
  queryCache.set(cacheKey(), { events: [...events], nextCursor });
}

/* ── Theme toggle ── */

function createThemeToggle() {
  const btn = document.createElement("button");
  btn.className = "theme-toggle";
  btn.setAttribute("aria-label", "Toggle theme");
  btn.innerHTML = getCurrentTheme() === "dark"
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  btn.addEventListener("click", () => {
    toggleTheme();
    const isDark = getCurrentTheme() === "dark";
    btn.innerHTML = isDark
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  });
  return btn;
}

function createHeader() {
  const header = document.createElement("header");
  header.className = "page-header";
  const heading = document.createElement("div");
  heading.className = "page-header-heading";
  heading.innerHTML = '<h1>Vouchers &amp; Promotions</h1><p class="subtitle">Certification opportunities &mdash; curated</p>';
  header.appendChild(heading);
  header.appendChild(createThemeToggle());
  return header;
}

/* ── Initial states ── */

export function renderLoading() {
  showWelcomeModal();
  const app = document.getElementById("app");
  app.innerHTML = "";

  const header = createHeader();
  app.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "card-grid";
  grid.id = "card-grid";

  for (let i = 0; i < 6; i++) {
    grid.appendChild(createSkeleton());
  }

  app.appendChild(grid);
  app.appendChild(renderFooter());
}

export function renderError(message, retryFn) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const banner = document.createElement("div");
  banner.className = "error-banner";

  const msg = document.createElement("p");
  msg.className = "error-message";
  msg.textContent = message;
  banner.appendChild(msg);

  const btn = document.createElement("button");
  btn.className = "page-btn retry-btn";
  btn.textContent = "Retry";
  btn.addEventListener("click", () => retryFn());
  banner.appendChild(btn);

  app.appendChild(banner);
  app.appendChild(renderFooter());
}

/* ── Main render ── */

function renderApp(newEvents, nc, reset) {
  showWelcomeModal();
  if (reset) {
    events = newEvents;
    currentPage = 1;
    pageWindowStart = 1;
  } else {
    events = events.concat(newEvents);
    currentPage = Math.ceil(events.length / CLIENT_SIZE);
    pageWindowStart = Math.floor((currentPage - 1) / WINDOW_SIZE) * WINDOW_SIZE + 1;
  }

  nextCursor = nc;
  saveCache();

  const app = document.getElementById("app");
  app.innerHTML = "";

  const header = createHeader();
  app.appendChild(header);

  const filters = renderFilters();
  app.appendChild(filters);

  const grid = document.createElement("div");
  grid.className = "card-grid";
  grid.id = "card-grid";
  app.appendChild(grid);

  const pagination = document.createElement("nav");
  pagination.className = "pagination";
  pagination.id = "pagination";
  app.appendChild(pagination);

  app.appendChild(renderFooter());
  renderPage();
}

/* ── Filters ── */

function renderFilters() {
  const bar = document.createElement("div");
  bar.className = "filter-bar";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "search-input";
  searchInput.placeholder = "Search by title…";
  searchInput.value = getFilters().search;
  searchInput.addEventListener("input", (e) => setSearch(e.target.value));
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitSearch();
  });
  bar.appendChild(searchInput);

  const vendorSelect = document.createElement("select");
  vendorSelect.className = "filter-select";
  vendorSelect.addEventListener("change", (e) => setVendor(e.target.value));

  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All Vendors";
  vendorSelect.appendChild(allOpt);

  getVendors()
    .then((vendors) => {
      for (const v of vendors) {
        const opt = document.createElement("option");
        opt.value = v.vendor;
        opt.textContent = capitalize(v.vendor);
        vendorSelect.appendChild(opt);
      }
      vendorSelect.value = getFilters().vendor;
    })
    .catch((err) => console.error("Failed to load vendors:", err));

  bar.appendChild(vendorSelect);

  const sortSelect = document.createElement("select");
  sortSelect.className = "filter-select";
  sortSelect.innerHTML = `
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
  `;
  sortSelect.value = getFilters().sort;
  sortSelect.addEventListener("change", (e) => setSort(e.target.value));
  bar.appendChild(sortSelect);

  const searchBtn = document.createElement("button");
  searchBtn.className = "btn btn-primary";
  searchBtn.textContent = "Search";
  searchBtn.type = "button";
  searchBtn.addEventListener("click", () => submitSearch());
  bar.appendChild(searchBtn);

  const clearBtn = document.createElement("button");
  clearBtn.className = "btn btn-ghost";
  clearBtn.textContent = "Clear";
  clearBtn.type = "button";
  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    setSearch("");
    clearSearch();
  });
  bar.appendChild(clearBtn);

  return bar;
}

/* ── Page render ── */

function renderPage() {
  const grid = document.getElementById("card-grid");
  grid.innerHTML = "";

  const start = (currentPage - 1) * CLIENT_SIZE;
  const pageEvents = events.slice(start, start + CLIENT_SIZE);

  const fragment = document.createDocumentFragment();
  for (const event of pageEvents) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderVoucherCard(event);
    fragment.appendChild(wrapper.firstElementChild);
  }
  grid.appendChild(fragment);

  renderPagination();
}

function renderPagination() {
  const el = document.getElementById("pagination");
  el.innerHTML = "";

  const clientTotal = Math.ceil(events.length / CLIENT_SIZE);
  const hasMore = nextCursor !== null;

  if (clientTotal <= 1 && !hasMore) return;

  const prevBtn = document.createElement("button");
  prevBtn.className = "page-btn";
  prevBtn.textContent = "← Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      if (currentPage < pageWindowStart) {
        pageWindowStart = Math.max(1, pageWindowStart - WINDOW_SIZE);
      }
      renderPage();
    }
  });
  el.appendChild(prevBtn);

  const firstBtn = document.createElement("button");
  firstBtn.className = "page-btn";
  firstBtn.textContent = "<<";
  firstBtn.disabled = currentPage === 1;
  firstBtn.addEventListener("click", () => {
    currentPage = 1;
    pageWindowStart = 1;
    renderPage();
  });
  el.appendChild(firstBtn);

  const windowEnd = Math.min(pageWindowStart + WINDOW_SIZE - 1, clientTotal);
  for (let i = pageWindowStart; i <= windowEnd; i++) {
    const btn = document.createElement("button");
    btn.className = `page-btn${i === currentPage ? " active" : ""}`;
    btn.textContent = i;
    btn.addEventListener("click", () => {
      currentPage = i;
      if (i === windowEnd && windowEnd < clientTotal) {
        pageWindowStart = Math.min(pageWindowStart + WINDOW_SIZE, clientTotal);
      }
      renderPage();
    });
    el.appendChild(btn);
  }

  const lastBtn = document.createElement("button");
  lastBtn.className = "page-btn";
  lastBtn.textContent = ">>";
  lastBtn.disabled = pageWindowStart + WINDOW_SIZE > clientTotal;
  lastBtn.addEventListener("click", () => {
    pageWindowStart = Math.min(pageWindowStart + WINDOW_SIZE, clientTotal);
    currentPage = Math.min(pageWindowStart + WINDOW_SIZE - 1, clientTotal);
    renderPage();
  });
  el.appendChild(lastBtn);

  const nextBtn = document.createElement("button");
  nextBtn.className = "page-btn";
  nextBtn.textContent = "Next →";
  if (currentPage < clientTotal) {
    nextBtn.addEventListener("click", () => {
      currentPage++;
      if (currentPage > pageWindowStart + WINDOW_SIZE - 1) {
        pageWindowStart = Math.min(pageWindowStart + WINDOW_SIZE, clientTotal);
      }
      renderPage();
    });
  } else if (hasMore) {
    nextBtn.addEventListener("click", loadMore);
    nextBtn.id = "load-more-btn";
  } else {
    nextBtn.disabled = true;
  }
  el.appendChild(nextBtn);
}

/* ── Data fetching ── */

async function fetchAndRender(reset) {
  if (isFetching) return;
  isFetching = true;

  if (reset) {
    const cached = queryCache.get(cacheKey());
    if (cached) {
      events = [...cached.events];
      nextCursor = cached.nextCursor;
      currentPage = 1;
      renderApp(events, nextCursor, true);
      isFetching = false;
      return;
    }
    renderLoading();
  }

  try {
    const filters = getFilters();
    const { events: newEvents, nextCursor: nc } = await getEvents({
      ...filters,
      cursor: reset ? null : undefined,
    });
    renderApp(newEvents, nc, reset);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    if (reset) {
      renderError("Failed to load vouchers. Please check your connection and try again.", () => fetchAndRender(true));
    }
  } finally {
    isFetching = false;
  }
}

window.addEventListener("filterchange", () => fetchAndRender(true));

/* ── Load more ── */

async function loadMore() {
  if (isLoadingMore) return;
  isLoadingMore = true;

  const btn = document.getElementById("load-more-btn");
  const status = showLoadMoreStatus();

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Loading...";
  }

  try {
    const filters = getFilters();
    const { events: newEvents, nextCursor: nc } = await getEvents({ ...filters, cursor: nextCursor });

    events = events.concat(newEvents);
    nextCursor = nc;
    currentPage = Math.ceil(events.length / CLIENT_SIZE);
    saveCache();

    clearLoadMoreStatus();
    renderPage();
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
      btn.textContent = "Next →";
    }
  } finally {
    isLoadingMore = false;
  }
}

function showLoadMoreStatus() {
  clearLoadMoreStatus();

  const status = document.createElement("div");
  status.className = "load-more-status";
  status.id = "load-more-status";

  const spinner = document.createElement("span");
  spinner.className = "spinner";
  status.appendChild(spinner);

  const label = document.createElement("span");
  label.textContent = "Loading more vouchers…";
  status.appendChild(label);

  const pagination = document.getElementById("pagination");
  pagination.insertAdjacentElement("afterend", status);

  return status;
}

function clearLoadMoreStatus() {
  const existing = document.getElementById("load-more-status");
  if (existing) existing.remove();
}

/* ── Skeleton ── */

function createSkeleton() {
  const card = document.createElement("div");
  card.className = "skeleton-card";

  const title = document.createElement("div");
  title.className = "skeleton-line skeleton-title";
  card.appendChild(title);

  const link = document.createElement("div");
  link.className = "skeleton-line skeleton-link";
  card.appendChild(link);

  const meta = document.createElement("div");
  meta.className = "skeleton-meta";
  for (let i = 0; i < 3; i++) {
    const badge = document.createElement("div");
    badge.className = "skeleton-line skeleton-badge";
    meta.appendChild(badge);
  }
  card.appendChild(meta);

  const reason = document.createElement("div");
  reason.className = "skeleton-line skeleton-reason";
  card.appendChild(reason);

  return card;
}

/* ── Router ── */

const PAGE_ROUTES = {
  about: renderAboutPage,
  privacy: renderPrivacyPage,
  terms: renderTermsPage,
  disclaimer: renderDisclaimerPage,
};

function renderLegalRoute(hash) {
  const renderFn = PAGE_ROUTES[hash];
  if (!renderFn) return false;

  const app = document.getElementById("app");
  app.innerHTML = "";

  const header = createHeader();
  app.appendChild(header);

  const page = renderFn();
  app.appendChild(page);

  app.appendChild(renderFooter());
  return true;
}

function navigate() {
  const hash = location.hash.replace("#", "");
  if (!hash || hash === "home") {
    fetchAndRender(true);
    return;
  }
  renderLegalRoute(hash);
}

window.addEventListener("hashchange", navigate);

/* ── Bootstrap ── */

async function init() {
  initTheme();

  const hash = location.hash.replace("#", "");
  if (hash && PAGE_ROUTES[hash]) {
    renderLegalRoute(hash);
    return;
  }

  renderLoading();
  await fetchAndRender(true);
}

init();
