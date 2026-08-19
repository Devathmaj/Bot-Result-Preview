/* Shared helpers for Cloudflare Pages Functions.
 * Files under functions/_* are not routed — this module only centralizes
 * document shell markup, upstream fetching, caching, and JSON-LD builders
 * used by the individual route handlers. */

export const SITE_URL = "https://voucherbot-preview.pages.dev";

export function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const THEME_SCRIPT = `<script>(function(){try{var t=localStorage.getItem("voucherbot:theme");if(t!=="light"&&t!=="dark"){t=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>`;

export { THEME_SCRIPT };

const HEAD_ASSETS = `
  <link rel="icon" href="/assets/favicon.ico" type="image/x-icon">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;450;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">`;

export { HEAD_ASSETS };

export function htmlHeaders(ttl = 300) {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": `public, s-maxage=${ttl}, max-age=0, must-revalidate, stale-while-revalidate=3600`,
  };
}

export function jsonLdScript(obj) {
  const json = JSON.stringify(obj).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

export function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: SITE_URL + it.path } : {}),
    })),
  };
}

export interface DocumentOptions {
  path: string;
  title: string;
  description?: string;
  ogType?: string;
  body: string;
  /** JSON-LD or other <head> snippets inserted before theme/assets */
  scripts?: string;
  /** Raw additional <head> markup (twitter tags, verification, …) */
  extraHeadRaw?: string;
  /** Module entry point; defaults to the light detail-page bootstrap */
  entryScript?: string;
  /** Set false for error/unavailable responses */
  robots?: boolean;
}

export function renderDocument(opts: DocumentOptions) {
  const { path, title, description, ogType = "website", body } = opts;
  const isErrorPage = opts.robots === false;
  const descTag = description
    ? `\n  <meta name="description" content="${escapeHtml(description)}">`
    : "";
  const robotsTag = isErrorPage ? `\n  <meta name="robots" content="noindex">` : `\n  <meta name="robots" content="index, follow">`;
  const canonical = `${SITE_URL}${path}`;
  const twitter = `
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  ${description ? `<meta name="twitter:description" content="${escapeHtml(description)}">` : ""}
  <meta name="twitter:url" content="${escapeHtml(canonical)}">`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>${descTag}${robotsTag}
  ${isErrorPage ? "" : `<link rel="canonical" href="${escapeHtml(canonical)}">`}
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:site_name" content="VoucherBot">
  <meta property="og:title" content="${escapeHtml(title)}">
  ${description ? `<meta property="og:description" content="${escapeHtml(description)}">` : ""}${twitter}
  ${opts.scripts || ""}
  ${opts.extraHeadRaw || ""}
  ${THEME_SCRIPT}
  ${HEAD_ASSETS}
</head>
<body>
  <main id="app" tabindex="-1">
  ${body}
  </main>
  <script type="module" src="${opts.entryScript || "/js/detail.js"}"></script>
</body>
</html>`;
}

export async function fetchUpstreamJson(env: any, queryString: string): Promise<any> {
  const response = await fetch(env.SUPABASE_FUNCTION_URL + queryString, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-function-secret": env.FUNCTION_SECRET,
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
    },
  });
  if (!response.ok) throw new Error(`Upstream error: ${response.status}`);
  const body = await response.json();
  if (!body?.success || !Array.isArray(body.data)) throw new Error("Unexpected upstream envelope");
  return body;
}

export async function serveWithCache(request: Request, render: () => Response, ttl = 300): Promise<Response> {
  const cacheKey = new Request(request.url);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const response = render();
  if (response.status === 200) {
    await caches.default.put(cacheKey, response.clone());
  }
  return response;
}

export function createdAtMs(event: any): number {
  return event?.created_at ? Date.parse(event.created_at) : 0;
}

export function sortByCreatedDesc(list: any[]): any[] {
  return [...list].sort((a, b) => createdAtMs(b) - createdAtMs(a));
}
