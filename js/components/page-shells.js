import { escapeHtml, truncate } from "../utils.js";

export function renderBreadcrumbs(items) {
  const crumbs = items
    .map((c, i) => {
      const last = i === items.length - 1;
      const label = escapeHtml(truncate(c.label, 42));
      if (last || !c.href) {
        return `<span class="crumb current" aria-current="page">${label}</span>`;
      }
      return `<a class="crumb" href="${escapeHtml(c.href)}">${label}</a><span class="crumb-sep" aria-hidden="true">/</span>`;
    })
    .join("");

  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><div class="container">${crumbs}</div></nav>`;
}

export function renderMessagePage(title, bodyHtml) {
  return `
    ${renderBreadcrumbs([{ label: "Home", href: "/" }, { label: title }])}
    <div class="container">
      <section class="message-page">
        <h1 class="message-title">${escapeHtml(title)}</h1>
        <div class="message-body">${bodyHtml}</div>
        <p><a class="btn btn-primary message-home-btn" href="/">Browse all listings</a></p>
      </section>
    </div>
  `;
}
