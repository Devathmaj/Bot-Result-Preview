export function capitalize(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function resolveVendor(item) {
  return item.vendor || item.ai_result?.vendor || null;
}

export function generateSummary(item) {
  const ai = item.ai_result;
  if (!ai) return "View this certification opportunity.";

  if (ai.discount) {
    const vendor = resolveVendor(item);
    const suffix = vendor ? ` on ${escapeHtml(capitalize(vendor))} certification exams` : "";
    return `Save ${escapeHtml(ai.discount)}${suffix}.`;
  }

  if (ai.promotion_name) {
    return `${escapeHtml(ai.promotion_name)} available.`;
  }

  if (ai.is_voucher) {
    return "Free certification voucher available.";
  }

  return "View this certification opportunity.";
}

export function generateTags(item) {
  const ai = item.ai_result;
  if (!ai) return [];

  const tags = [];
  const seen = new Set();

  const add = (value) => {
    if (value == null) return;
    const str = String(value).trim();
    if (str && !seen.has(str.toLowerCase()) && tags.length < 4) {
      seen.add(str.toLowerCase());
      tags.push(str);
    }
  };

  add(ai.promotion_type);
  add(ai.promotion_name);

  if (Array.isArray(ai.certifications)) {
    for (const cert of ai.certifications) {
      add(cert);
    }
  }

  add(ai.regions);

  if (ai.is_voucher && tags.length < 4) {
    add("Exam Voucher");
  }

  return tags;
}

export function renderVoucherCard(item) {
  const { title, url, author, published_at, ai_result: ai } = item;

  const badges = [];
  const vendorName = capitalize(resolveVendor(item) || "Uncategorized");
  badges.push(`<span class="inline-flex items-center px-3 py-0.5 text-xs font-medium bg-[var(--badge-vendor-bg)] text-[var(--badge-vendor-text)]">${escapeHtml(vendorName)}</span>`);
  if (ai?.discount) {
    badges.push(`<span class="inline-flex items-center px-3 py-0.5 text-xs font-medium bg-[var(--badge-discount-bg)] text-[var(--badge-discount-text)]">${escapeHtml(ai.discount)}</span>`);
  } else if (ai?.is_voucher) {
    badges.push(`<span class="inline-flex items-center px-3 py-0.5 text-xs font-medium bg-[var(--badge-voucher-bg)] text-[var(--badge-voucher-text)]">Voucher</span>`);
  }

  const summary = generateSummary(item);
  const tags = generateTags(item);

  const metaRows = [];
  if (ai?.end_date) metaRows.push(`\u{1F4C5} Ends ${formatDate(ai.end_date)}`);
  if (ai?.start_date && !ai?.end_date) metaRows.push(`\u{1F4C5} Starts ${formatDate(ai.start_date)}`);
  if (author) metaRows.push(`\u{1F464} ${escapeHtml(author)}`);
  if (published_at) metaRows.push(`\u{1F4F0} ${formatDate(published_at)}`);

  return `
    <div class="bg-[var(--bg-card)] border-2 border-[var(--border)] p-8 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]">
      ${badges.length ? `<div class="flex flex-wrap gap-1.5">${badges.join("")}</div>` : ""}
      <h3 class="text-lg font-semibold text-[var(--text-primary)] leading-snug font-['Cormorant_Garamond',Georgia,serif]">${escapeHtml(title || "Untitled")}</h3>
      <p class="text-sm text-[var(--text-secondary)] leading-relaxed">${escapeHtml(summary)}</p>
      ${tags.length ? `<div class="flex flex-wrap gap-1">${tags.map(t => `<span class="inline-flex items-center px-3 py-0.5 text-xs font-medium bg-[var(--tag-bg)] text-[var(--tag-text)]">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      ${metaRows.length ? `<div class="flex flex-col gap-0.5 text-xs text-[var(--text-muted)]">${metaRows.map(r => `<p>${r}</p>`).join("")}</div>` : ""}
      <div class="mt-auto pt-2">
        <a href="${escapeHtml(url || "#")}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-[var(--btn-text)] bg-[var(--btn-bg)] border-2 border-[var(--btn-border)] hover:bg-[var(--btn-hover-bg)] hover:border-[var(--btn-hover-border)] transition-colors duration-150">
          View Details
        </a>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
