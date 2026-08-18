export function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function capitalize(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

const VENDOR_LABELS = {
  uncategorized: "Other",
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

export function formatShortDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "";
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const year = sameYear ? "" : ` ${d.getFullYear()}`;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}${year}`;
}

export function formatFullDate(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
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
