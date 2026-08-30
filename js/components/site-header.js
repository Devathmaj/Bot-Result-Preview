import { ICONS } from "./icons.js";
import { getCurrentTheme, toggleTheme } from "../theme.js";

export function renderSiteHeader() {
  const isDark = getCurrentTheme() === "dark";
  const themeIcon = isDark ? ICONS.sun : ICONS.moon;

  return `
    <a href="#app" class="skip-link">Skip to content</a>
    <header class="site-header">
      <div class="container site-header-inner">
        <div class="brand">
          <a href="/" class="brand-link" aria-label="VoucherBot home">
            <span class="brand-mark" aria-hidden="true">V</span>
            <span class="brand-name">VoucherBot</span>
          </a>
          <span class="brand-tagline">Certification discounts &amp; opportunities</span>
        </div>
        <nav class="site-nav" aria-label="Primary">
          <button type="button" class="nav-link" data-how-it-works-open>How it works</button>
          <a href="/#notifications" class="nav-link">Notifications</a>
          <a href="/#donate" class="nav-link">Donate</a>
          <button type="button" class="theme-toggle" data-theme-toggle aria-label="Toggle color theme">${themeIcon}</button>
        </nav>
      </div>
    </header>
  `;
}

export function bindThemeToggleBehavior() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  btn.innerHTML = getCurrentTheme() === "dark" ? ICONS.sun : ICONS.moon;
  btn.addEventListener("click", () => {
    toggleTheme();
    btn.innerHTML = getCurrentTheme() === "dark" ? ICONS.sun : ICONS.moon;
  });
}
