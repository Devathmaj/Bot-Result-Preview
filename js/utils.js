export function formatDate(date) {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function truncate(text, length) {
  if (typeof text !== "string") {
    return "";
  }

  if (text.length <= length) {
    return text;
  }

  return text.slice(0, length) + "...";
}
