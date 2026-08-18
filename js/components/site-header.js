import { ICONS } from "./icons.js";
import { getCurrentTheme } from "../theme.js";

export function renderSiteHeader() {
  const isDark = getCurrentTheme() === "dark";
  const themeIcon = isDark ? ICONS.sun : ICONS.moon;

  return `
    <a href="#feed" class="skip-link">Skip to listings</a>
    <header class="site-header">
      <div class="container site-header-inner">
        <div class="brand">
          <a href="#" class="brand-link" aria-label="VoucherBot home">
            <span class="brand-mark" aria-hidden="true">V</span>
            <span class="brand-name">VoucherBot</span>
          </a>
          <span class="brand-tagline">Certification discounts &amp; opportunities</span>
        </div>
        <nav class="site-nav" aria-label="Primary">
          <a href="#how-it-works" class="nav-link">How it works</a>
          <a href="#notifications" class="nav-link">Notifications</a>
          <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme">${themeIcon}</button>
        </nav>
      </div>
    </header>
  `;
}
