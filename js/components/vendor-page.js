import { escapeHtml, vendorLabel } from "../utils.js";
import { renderOpportunityCard } from "./opportunity-card.js";
import { renderBreadcrumbs } from "./page-shells.js";

export function renderVendorPage(vendor, events, totalAvailable) {
  const name = vendorLabel(vendor);
  const count = Array.isArray(events) ? events.length : 0;

  return `
    ${renderBreadcrumbs([{ label: "Home", href: "/" }, { label: `${name} listings` }])}
    <section class="container page-head">
      <h1 class="hero-title">${escapeHtml(name)} certification opportunities</h1>
      <p class="hero-sub">
        ${count === 1 ? "1 listing" : `${count} listings`} from this vendor,
        shown as discovered. ${typeof totalAvailable === "number" && totalAvailable > count ? `Showing the most recent ${count}.` : ""}
      </p>
      <div class="page-head-actions">
        <a class="btn btn-primary" href="/?vendor=${encodeURIComponent(vendor)}">Browse &amp; filter in feed</a>
        <a class="btn btn-ghost" href="/">All vendors</a>
      </div>
    </section>
    <div class="container">
      <h2 class="sr-only">${escapeHtml(name)} listings</h2>
      ${
        count
          ? `<div class="card-grid" id="card-grid">\n${events.map((e) => renderOpportunityCard(e)).join("\n")}\n</div>`
          : `<div class="empty-state"><p class="empty-title">No listings from this vendor right now.</p><p><a class="btn btn-ghost" href="/">Browse all listings</a></p></div>`
      }
    </div>
  `;
}
