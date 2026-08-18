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

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  try {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch (e) {}
  return "light";
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
