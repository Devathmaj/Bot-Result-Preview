import { getFilters } from "../app.js";
import { escapeHtml, vendorLabel } from "../utils.js";

export function renderFilterBar(vendors) {
  const filters = getFilters();

  let vendorOptions = "";
  if (Array.isArray(vendors)) {
    for (const v of vendors) {
      const selected = filters.vendor === v.vendor ? " selected" : "";
      vendorOptions += `<option value="${escapeHtml(v.vendor)}"${selected}>${escapeHtml(vendorLabel(v.vendor))}</option>`;
    }
  }

  const sel = (current, value) => (current === value ? " selected" : "");

  return `
    <div class="filter-bar" data-filter-bar>
      <label class="filter-field">
        <span class="filter-label">Vendor</span>
        <select class="filter-select" data-filter-vendor aria-label="Filter by vendor">
          <option value="all"${sel(filters.vendor, "all")}>All vendors</option>
          ${vendorOptions}
        </select>
      </label>
      <label class="filter-field">
        <span class="filter-label">Discovered</span>
        <select class="filter-select" data-filter-discovered aria-label="Filter by discovery date">
          <option value="any"${sel(filters.discovered, "any")}>Any time</option>
          <option value="7d"${sel(filters.discovered, "7d")}>Past week</option>
          <option value="30d"${sel(filters.discovered, "30d")}>Past month</option>
        </select>
      </label>
      <label class="filter-field">
        <span class="filter-label">AI flag</span>
        <select class="filter-select" data-filter-flag aria-label="Filter by analysis confidence">
          <option value="any"${sel(filters.flag, "any")}>Any level</option>
          <option value="high"${sel(filters.flag, "high")}>High</option>
          <option value="moderate"${sel(filters.flag, "moderate")}>Moderate</option>
          <option value="lower"${sel(filters.flag, "lower")}>Lower</option>
        </select>
      </label>
      <label class="filter-field">
        <span class="filter-label">Sort</span>
        <select class="filter-select" data-filter-sort aria-label="Sort listings">
          <option value="newest"${sel(filters.sort, "newest")}>Newest first</option>
          <option value="oldest"${sel(filters.sort, "oldest")}>Oldest first</option>
        </select>
      </label>
      <button type="button" class="btn btn-ghost filter-clear${isFilterActive(filters) ? "" : " hidden"}" data-filter-clear>
        Clear
      </button>
    </div>
  `;
}

function isFilterActive(filters) {
  const f = filters || getFilters();
  return Boolean(f.search) || f.vendor !== "all" || f.discovered !== "any" || f.flag !== "any";
}
