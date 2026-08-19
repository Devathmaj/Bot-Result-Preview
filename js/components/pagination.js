export function renderPaginationHtml({ currentPage, totalPages, windowStart, windowEnd, hasMore }) {
  if (totalPages <= 1 && !hasMore) return "";

  const btn = (label, action, opts = {}) => {
    const attrs = [
      `type="button"`,
      `class="page-btn${opts.active ? " active" : ""}"`,
      `data-page-action="${action}"`,
      opts.page != null ? `data-page="${opts.page}"` : "",
      opts.disabled ? "disabled" : "",
      opts.id ? `id="${opts.id}"` : "",
      opts.label ? `aria-label="${opts.label}"` : "",
      opts.active ? `aria-current="true"` : "",
    ].filter(Boolean).join(" ");
    return `<button ${attrs}>${label}</button>`;
  };

  let html = btn("&larr;", "prev", { disabled: currentPage === 1, label: "Previous page" });
  html += btn("&#171;", "first", { disabled: currentPage === 1, label: "First page" });

  for (let i = windowStart; i <= windowEnd; i++) {
    html += btn(String(i), "goto", { page: i, active: i === currentPage, label: `Page ${i}` });
  }

  html += btn("&#187;", "last", {
    disabled: currentPage >= totalPages,
    label: "Last page",
  });

  const atEnd = currentPage >= totalPages;
  const useMore = hasMore && atEnd;
  html += btn("Next &rarr;", useMore ? "more" : "next", {
    id: useMore ? "load-more-btn" : "",
    disabled: !useMore && atEnd,
    label: "Next page",
  });

  return html;
}

export function paginationState(totalCount, nextCursor, currentPage, pageWindowStart, CLIENT_SIZE, WINDOW_SIZE) {
  const totalPages = Math.ceil(totalCount / CLIENT_SIZE);
  const hasMore = nextCursor !== null;
  const windowStart = Math.max(1, Math.min(pageWindowStart, totalPages));
  const windowEnd = Math.min(windowStart + WINDOW_SIZE - 1, totalPages);
  return { currentPage, totalPages, hasMore, windowStart, windowEnd };
}
