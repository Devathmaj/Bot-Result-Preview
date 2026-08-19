import { escapeHtml, vendorLabel, vendorSlug, formatFullDate, hostOf, confidenceTier } from "../utils.js";
import { generateCardSummary, renderAiFlag } from "./opportunity-card.js";
import { renderOpportunityCard } from "./opportunity-card.js";
import { renderBreadcrumbs } from "./page-shells.js";

function factRow(label, valueHtml) {
  if (valueHtml == null || valueHtml === "") return "";
  return `<div class="fact-row"><dt>${label}</dt><dd>${valueHtml}</dd></div>`;
}

export function renderOpportunityDetail(item) {
  const ai = item.ai_result || {};
  const url = item.url || "#";
  const host = hostOf(url);
  const tier = confidenceTier(ai.confidence);
  const summary = generateCardSummary(item);
  const vendorHref = item.vendor ? `/vendors/${encodeURIComponent(vendorSlug(item.vendor))}` : null;
  const vendorName = vendorLabel(item.vendor);

  const certs = Array.isArray(ai.certifications) ? ai.certifications.filter(Boolean) : [];
  const regions = Array.isArray(ai.regions) ? ai.regions.filter(Boolean) : [];

  return `
    ${renderBreadcrumbs([
      { label: "Home", href: "/" },
      ...(item.vendor ? [{ label: vendorName, href: vendorHref }] : []),
      { label: item.title || "Listing" },
    ])}
    <article class="container detail-page">
      <header class="detail-head">
        <div class="card-top">
          ${vendorHref ? `<a class="vendor-chip-static" href="${vendorHref}">${escapeHtml(vendorName)}</a>` : `<span class="vendor-chip-static">${escapeHtml(vendorName)}</span>`}
          ${ai.discount ? `<span class="discount-chip">${escapeHtml(ai.discount)}</span>` : ""}
          ${renderAiFlag(ai)}
        </div>
        <h1 class="detail-title">${escapeHtml(item.title || "Untitled listing")}</h1>
        ${summary ? `<p class="detail-summary">${escapeHtml(summary)}</p>` : ""}
      </header>

      <section class="detail-section" aria-label="Listing details">
        <h2 class="detail-section-heading">Details</h2>
        <dl class="facts">
          ${factRow("Vendor", item.vendor ? escapeHtml(vendorName) : "")}
          ${factRow("Type", ai.promotion_type ? escapeHtml(ai.promotion_type) : "")}
          ${factRow("Certifications", certs.length ? certs.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join(" ") : "")}
          ${factRow("Regions", regions.length ? regions.map((r) => `<span class="tag">${escapeHtml(r)}</span>`).join(" ") : "")}
          ${factRow("Promotion", ai.promotion_name ? escapeHtml(ai.promotion_name) : "")}
          ${factRow("Listed", item.created_at ? escapeHtml(formatFullDate(item.created_at)) : "")}
          ${factRow("Source published", item.published_at ? escapeHtml(formatFullDate(item.published_at)) : "")}
          ${factRow("Reported by", item.author ? escapeHtml(item.author) : "")}
          ${factRow("Source", host ? `<span class="meta-host">${escapeHtml(host)}</span>` : "")}
        </dl>
      </section>

      <section class="detail-section ai-panel" aria-label="AI assessment">
        <h2 class="detail-section-heading">AI assessment</h2>
        <p class="ai-panel-framing">
          This listing was identified by automated analysis. The assessment below
          describes how confident that analysis was &mdash; it is not a verification of the offer.
        </p>
        ${
          tier
            ? `<p class="ai-panel-tier">
                 <span class="ai-flag">${tier.label} confidence</span>
                 <span class="ai-score">score ${escapeHtml(String(ai.confidence))}</span>
               </p>`
            : `<p class="ai-panel-tier"><span class="ai-flag">No structured assessment available</span></p>`
        }
        ${
          ai.reason
            ? `<blockquote class="ai-reason">
                 <span class="ai-reason-label">Why it was flagged:</span>
                 &ldquo;${escapeHtml(ai.reason)}&rdquo;
               </blockquote>`
            : ""
        }
        <p class="ai-note">Automated analysis is imperfect and may misidentify content.</p>
      </section>

      <section class="detail-section disclaimer-panel" aria-label="Disclaimer">
        <p>Listings are collected and assessed automatically, may be incomplete or out of date,
        and are not endorsements. Availability and terms are controlled by the issuing
        organization &mdash; review the original source before acting on any offer.</p>
      </section>

      <div class="detail-cta-row">
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="source-btn source-btn-lg">
          Open the original source
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
        <a href="/" class="btn btn-ghost">All listings</a>
      </div>

      <footer class="detail-source-url">Original URL: <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a></footer>
    </article>
  `;
}

export function renderRelatedSection(items, vendor) {
  if (!items.length) return "";
  return `
    <aside class="related-section container" aria-label="Related listings">
      <h2 class="section-heading">More from ${escapeHtml(vendorLabel(vendor))}</h2>
      <div class="card-grid related-grid">
        ${items.map((it) => renderOpportunityCard(it)).join("\n")}
      </div>
    </aside>
  `;
}
