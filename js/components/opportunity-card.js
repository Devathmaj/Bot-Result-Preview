import {
  escapeHtml,
  vendorLabel,
  vendorSlug,
  formatShortDate,
  hostOf,
  truncate,
  confidenceTier,
} from "../utils.js";

export function generateCardSummary(item) {
  const ai = item.ai_result;
  if (item.summary) return item.summary;
  if (!ai) return "";
  const vendor = item.vendor ? ` ${vendorLabel(item.vendor)} certification exams` : "";
  if (ai.discount) return `Save ${ai.discount}${vendor ? ` on${vendor}` : ""}.`;
  if (ai.promotion_name) return `${ai.promotion_name}.`;
  return "";
}

export function renderAiFlag(ai) {
  const tier = confidenceTier(ai?.confidence);
  if (!tier) return "";
  const dots = [1, 2, 3].map((i) => `<span class="ai-dot${i <= tier.level ? " on" : ""}"></span>`).join("");
  return `
    <span class="ai-flag" title="Confidence of the automated analysis that identified this listing — not a verification of the offer.">
      <span class="ai-dots" aria-hidden="true">${dots}</span>
      <span class="ai-label">AI &middot; ${tier.label}</span>
    </span>
  `;
}

function renderTags(ai) {
  if (!ai) return "";
  const tags = [];
  const certs = Array.isArray(ai.certifications) ? ai.certifications.filter(Boolean) : [];
  for (const c of certs.slice(0, 2)) tags.push(c);
  const extra = Math.max(0, certs.length - 2);
  if (extra > 0) tags.push(`+${extra} more`);
  if (Array.isArray(ai.regions) && ai.regions[0]) tags.push(ai.regions[0]);
  if (!tags.length && ai.is_voucher && !ai.discount) tags.push("Voucher");
  if (!tags.length) return "";

  return `
    <div class="card-tags">
      ${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
    </div>
  `;
}

export function renderOpportunityCard(item) {
  const url = item.url || "#";
  const detailUrl = `/opportunities/${encodeURIComponent(item.id)}`;
  const vendorHref = item.vendor ? `/vendors/${encodeURIComponent(vendorSlug(item.vendor))}` : null;
  const host = hostOf(url);
  const listed = formatShortDate(item.created_at);
  const author = item.author ? truncate(item.author, 48) : "";
  const summary = generateCardSummary(item);
  const discount = item.ai_result?.discount;

  return `
    <article class="opportunity-card">
      <div class="card-top">
        ${vendorHref ? `<a class="vendor-chip-static" href="${vendorHref}">${escapeHtml(vendorLabel(item.vendor))}</a>` : `<span class="vendor-chip-static">${escapeHtml(vendorLabel(item.vendor))}</span>`}
        ${discount ? `<span class="discount-chip">${escapeHtml(discount)}</span>` : ""}
        ${renderAiFlag(item.ai_result)}
      </div>
      <h3 class="card-title">
        <a href="${escapeHtml(detailUrl)}">${escapeHtml(item.title || "Untitled")}</a>
      </h3>
      ${summary ? `<p class="card-summary">${escapeHtml(summary)}</p>` : ""}
      ${renderTags(item.ai_result)}
      <div class="card-meta">
        ${host ? `<span class="meta-host">${escapeHtml(host)}</span><span class="meta-sep" aria-hidden="true">&middot;</span>` : ""}
        ${listed ? `<span>Listed ${listed}</span>` : ""}
        ${author ? `<span class="meta-author" title="${escapeHtml(item.author)}">via ${escapeHtml(author)}</span>` : ""}
      </div>
      <div class="card-cta">
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="source-btn">
          Open source
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </article>
  `;
}
