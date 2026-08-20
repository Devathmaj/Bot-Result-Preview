const STORAGE_KEY = "voucherbot:theme";

const hasDom = () => typeof document !== "undefined";

function applyTheme(theme) {
  if (!hasDom()) return;
  document.documentElement.setAttribute("data-theme", theme);
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) {}
  return null;
}

/* Theme precedence: explicit visitor choice (localStorage) wins; the
 * site otherwise always opens in light mode — OS preference is
 * intentionally not consulted. */
function getPreferredTheme() {
  return getStoredTheme() || "light";
}

export function initTheme() {
  applyTheme(getPreferredTheme());
}

export function toggleTheme() {
  const current = hasDom() ? document.documentElement.getAttribute("data-theme") : "light";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch (e) {}
}

export function getCurrentTheme() {
  return hasDom() ? document.documentElement.getAttribute("data-theme") || "light" : "light";
}
