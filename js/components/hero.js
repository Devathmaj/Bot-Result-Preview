import { ICONS } from "./icons.js";
import { escapeHtml, vendorLabel } from "../utils.js";

export function renderHero(vendors) {
  const chips = Array.isArray(vendors)
    ? vendors
        .map(
          (v) => `
            <button type="button" class="vendor-chip" data-vendor="${escapeHtml(v.vendor)}">${escapeHtml(vendorLabel(v.vendor))}</button>`
        )
        .join("")
    : "";

  return `
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">Certification discounts &amp; opportunities</h1>
        <p class="hero-sub">
          Exam discounts, free exam offers, beta exams, and training promotions &mdash;
          collected automatically from vendor sites, training providers, and community
          sources, and listed here as they are discovered.
        </p>
        <form class="hero-search" role="search" data-search-form>
          <span class="hero-search-icon" aria-hidden="true">${ICONS.search}</span>
          <input
            type="text"
            class="search-input"
            name="search"
            placeholder="Search listing titles&hellip;"
            aria-label="Search listing titles"
            autocomplete="off"
          />
          <button type="submit" class="btn btn-primary hero-search-btn">Search</button>
        </form>
        ${chips ? `<div class="vendor-chips" aria-label="Browse by vendor">${chips}</div>` : ""}
      </div>
    </section>
  `;
}
