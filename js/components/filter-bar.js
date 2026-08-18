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

  return `
    <div class="filter-bar" data-filter-bar>
      <label class="filter-field">
        <span class="filter-label">Vendor</span>
        <select class="filter-select" data-filter-vendor aria-label="Filter by vendor">
          <option value="all"${filters.vendor === "all" ? " selected" : ""}>All vendors</option>
          ${vendorOptions}
        </select>
      </label>
      <label class="filter-field">
        <span class="filter-label">Sort</span>
        <select class="filter-select" data-filter-sort aria-label="Sort listings">
          <option value="newest"${filters.sort === "newest" ? " selected" : ""}>Newest first</option>
          <option value="oldest"${filters.sort === "oldest" ? " selected" : ""}>Oldest first</option>
        </select>
      </label>
      <button type="button" class="btn btn-ghost filter-clear${filters.search || filters.vendor !== "all" ? "" : " hidden"}" data-filter-clear>
        Clear
      </button>
    </div>
  `;
}
