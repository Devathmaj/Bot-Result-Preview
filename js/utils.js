export function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function capitalize(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const UNCATEGORIZED = "Uncategorized";

/* Upstream stores vendor as NULL for unclassified items while the facet
 * list exposes them as "Uncategorized". Normalize once at the boundary
 * so every consumer (counts, filters, pages) sees a consistent value. */
export function normalizeEvent(event) {
  if (!event || (event.vendor && String(event.vendor).trim())) return event;
  return { ...event, vendor: UNCATEGORIZED };
}

const VENDOR_LABELS = {
  aws: "AWS",
  suse: "SUSE",
};

export function vendorLabel(vendor) {
  if (!vendor) return "Uncategorized";
  const key = String(vendor).trim().toLowerCase();
  return VENDOR_LABELS[key] || capitalize(key);
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Dates are formatted in UTC so server-rendered and client-rendered
 * output are identical regardless of the viewer's timezone. */
export function formatShortDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "";
  const sameYear = d.getUTCFullYear() === new Date().getUTCFullYear();
  const year = sameYear ? "" : ` ${d.getUTCFullYear()}`;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}${year}`;
}

export function formatFullDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

export function truncate(text, length) {
  if (typeof text !== "string") return "";
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

export function vendorSlug(vendor) {
  if (!vendor) return "";
  return String(vendor).trim().toLowerCase().replace(/\s+/g, "-");
}

export function matchesQuery(item, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const ai = item.ai_result || {};
  const fields = [
    item.title,
    item.summary,
    item.vendor,
    item.vendor ? vendorLabel(item.vendor) : "",
    item.author,
    ai.promotion_name,
  ];
  return fields.some((f) => typeof f === "string" && f.toLowerCase().includes(q));
}

export function confidenceTier(confidence) {
  if (typeof confidence !== "number") return null;
  if (confidence >= 0.85) return { key: "high", label: "High", level: 3 };
  if (confidence >= 0.6) return { key: "moderate", label: "Moderate", level: 2 };
  return { key: "lower", label: "Lower", level: 1 };
}

export function countByVendor(events) {
  const counts = {};
  for (const e of events || []) {
    if (e?.vendor) counts[e.vendor] = (counts[e.vendor] || 0) + 1;
  }
  return counts;
}
