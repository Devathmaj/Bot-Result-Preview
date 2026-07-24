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
  badges.push(`<span class="badge badge-vendor">${escapeHtml(vendorName)}</span>`);
  if (ai?.discount) {
    badges.push(`<span class="badge badge-discount">${escapeHtml(ai.discount)}</span>`);
  } else if (ai?.is_voucher) {
    badges.push(`<span class="badge badge-voucher">Voucher</span>`);
  }

  const summary = generateSummary(item);
  const tags = generateTags(item);

  const metaRows = [];
  if (ai?.end_date) metaRows.push(`\u{1F4C5} Ends ${formatDate(ai.end_date)}`);
  if (ai?.start_date && !ai?.end_date) metaRows.push(`\u{1F4C5} Starts ${formatDate(ai.start_date)}`);
  if (author) metaRows.push(`\u{1F464} ${escapeHtml(author)}`);
  if (published_at) metaRows.push(`\u{1F4F0} ${formatDate(published_at)}`);

  return `
    <div class="card">
      ${badges.length ? `<div class="badge-group">${badges.join("")}</div>` : ""}
      <h3 class="card-title">${escapeHtml(title || "Untitled")}</h3>
      <p class="card-summary">${escapeHtml(summary)}</p>
      ${tags.length ? `<div class="tag-group">${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      ${metaRows.length ? `<div class="card-meta">${metaRows.map(r => `<p>${r}</p>`).join("")}</div>` : ""}
      <div class="card-btn-wrapper">
        <a href="${escapeHtml(url || "#")}" target="_blank" rel="noopener noreferrer" class="card-btn">
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
