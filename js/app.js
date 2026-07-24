let searchQuery = "";
let selectedVendor = "all";
let selectedSort = "newest";

export function getFilters() {
  return { search: searchQuery, vendor: selectedVendor, sort: selectedSort };
}

export function setSearch(value) {
  searchQuery = value;
}

export function setVendor(value) {
  selectedVendor = value;
  window.dispatchEvent(new CustomEvent("filterchange"));
}

export function setSort(value) {
  selectedSort = value;
  window.dispatchEvent(new CustomEvent("filterchange"));
}

export function submitSearch() {
  window.dispatchEvent(new CustomEvent("filterchange"));
}

export function clearSearch() {
  searchQuery = "";
  window.dispatchEvent(new CustomEvent("filterchange"));
}
