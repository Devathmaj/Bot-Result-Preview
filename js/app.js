let searchQuery = "";
let selectedVendor = "all";
let selectedSort = "newest";
let selectedDiscovered = "any";
let selectedFlag = "any";

export function getFilters() {
  return {
    search: searchQuery,
    vendor: selectedVendor,
    sort: selectedSort,
    discovered: selectedDiscovered,
    flag: selectedFlag,
  };
}

export function setSearch(value) {
  searchQuery = value ?? "";
}

export function setVendor(value) {
  selectedVendor = value || "all";
  window.dispatchEvent(new CustomEvent("filterchange"));
}

export function setSort(value) {
  selectedSort = value === "oldest" ? "oldest" : "newest";
  window.dispatchEvent(new CustomEvent("filterchange"));
}

export function setDiscovered(value) {
  selectedDiscovered = value === "7d" || value === "30d" ? value : "any";
  window.dispatchEvent(new CustomEvent("filterchange"));
}

export function setFlag(value) {
  const valid = ["high", "moderate", "lower"];
  selectedFlag = valid.includes(value) ? value : "any";
  window.dispatchEvent(new CustomEvent("filterchange"));
}

export function submitSearch() {
  window.dispatchEvent(new CustomEvent("filterchange"));
}

export function clearSearch() {
  searchQuery = "";
}

/* Reset every filter in one state mutation and dispatch exactly one
 * change event — avoids intermediate-event races in the pipeline. */
export function resetFilters() {
  searchQuery = "";
  selectedVendor = "all";
  selectedSort = "newest";
  selectedDiscovered = "any";
  selectedFlag = "any";
  window.dispatchEvent(new CustomEvent("filterchange"));
}

/* ── Shareable URL params (q, vendor, sort, discovered, flag) ── */

const PARAM_MAP = { q: "search", vendor: "vendor", sort: "sort", discovered: "discovered", flag: "flag" };

export function readFiltersFromUrl(searchString) {
  const params = new URLSearchParams(searchString || "");
  if (params.has("q")) searchQuery = params.get("q");
  if (params.has("vendor")) selectedVendor = params.get("vendor") || "all";
  if (params.has("sort")) selectedSort = params.get("sort") === "oldest" ? "oldest" : "newest";
  const d = params.get("discovered");
  if (d === "7d" || d === "30d") selectedDiscovered = d;
  const f = params.get("flag");
  if (["high", "moderate", "lower"].includes(f)) selectedFlag = f;
}

export function filtersToUrl(filters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.vendor && filters.vendor !== "all") params.set("vendor", filters.vendor);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.discovered && filters.discovered !== "any") params.set("discovered", filters.discovered);
  if (filters.flag && filters.flag !== "any") params.set("flag", filters.flag);
  const s = params.toString();
  return s ? `/?${s}` : "/";
}
