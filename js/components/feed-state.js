export function renderSkeletonGrid(count = 6) {
  const card = `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-line skeleton-chip"></div>
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text short"></div>
      <div class="skeleton-meta">
        <div class="skeleton-line skeleton-badge"></div>
        <div class="skeleton-line skeleton-badge"></div>
      </div>
    </div>
  `;
  return `<div class="card-grid">${card.repeat(count)}</div>`;
}

export function renderEmptyState() {
  return `
    <div class="empty-state">
      <p class="empty-title">No listings match your search.</p>
      <p class="empty-hint">Try a shorter term or clear the filters.</p>
      <button type="button" class="btn btn-ghost" data-empty-clear>Clear filters</button>
    </div>
  `;
}

export function renderErrorState(message, retryId = "retry-btn") {
  return `
    <div class="error-banner" role="alert">
      <p class="error-message">${message}</p>
      <button type="button" class="btn btn-primary" id="${retryId}">Retry</button>
    </div>
  `;
}

export function renderResultsCount(count) {
  const label = count === 1 ? "listing" : "listings";
  return `${count} ${label}`;
}
