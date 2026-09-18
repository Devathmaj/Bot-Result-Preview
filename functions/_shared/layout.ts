/* Shared helpers for Cloudflare Pages Functions.
 * Files under functions/_* are not routed — this module only centralizes
 * document shell markup, upstream fetching, caching, and JSON-LD builders
 * used by the individual route handlers. */

export const SITE_URL = "https://voucherbot.pages.dev";

export function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const THEME_SCRIPT = `<script>(function(){try{var t=localStorage.getItem("voucherbot:theme");if(t!=="light"&&t!=="dark")t="light";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>`;

export { THEME_SCRIPT };

const HEAD_ASSETS = `
  <link rel="icon" href="/assets/favicon.ico" type="image/x-icon">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;450;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">`;

export { HEAD_ASSETS };

/* Note: Cloudflare's server-side Cache API ignores stale-while-revalidate —
 * that directive only benefits browser back/forward navigations. At the
 * edge, objects are fresh until s-maxage elapses, then a plain miss. */
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
  ${renderHowItWorksModal()}
  <script type="module" src="${opts.entryScript || "/js/detail.js"}"></script>
</body>
</html>`;
}

/** Build an upstream URL regardless of whether the caller included a
 * leading "?" and whether the configured base URL already carries one. */
export function upstreamUrl(env: any, queryString: string): string {
  const base = env.SUPABASE_FUNCTION_URL;
  const qs = queryString.startsWith("?") ? queryString.slice(1) : queryString;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${qs}`;
}

export async function fetchUpstreamJson(env: any, queryString: string): Promise<any> {
  const response = await fetch(upstreamUrl(env, queryString), {
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

export async function serveWithCache(
  request: Request,
  render: () => Response | Promise<Response>,
  ttl = 300
): Promise<Response> {
  const cacheKey = new Request(request.url);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  // Await regardless of whether the route handler is synchronous or async.
  const response = await render();
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

/* ── Dataset assembly ──
 * The upstream clamps every page to 100 rows, so datasets larger than
 * PAGE_SIZE are assembled through cursor pagination. All limits come
 * from js/config.js — no route may hardcode its own. */

import { PAGE_SIZE, MAX_UPSTREAM_PAGES, DETAIL_RELATED_TARGET, ID_INDEX_TTL_MS } from "../../js/config.js";
import { normalizeEvent } from "../../js/utils.js";
import { renderHowItWorksModal } from "../../js/components/how-it-works.js";

export async function fetchUpstreamPage(env: any, queryString: string): Promise<any> {
  const body = await fetchUpstreamJson(env, queryString);
  body.data = body.data.map(normalizeEvent);
  return body;
}

/** Assemble the opportunity dataset through cursor pagination.
 * Returns everything up to MAX_UPSTREAM_PAGES × PAGE_SIZE rows, plus a
 * `complete` flag and the boundary cursor if the safety caps stopped
 * the assembly early. */
export async function fetchAllOpportunities(
  env: any,
  opts: { vendor?: string; collectCap?: number; onPage?: (pageEvents: any[]) => void } = {}
): Promise<{ events: any[]; complete: boolean; pages: number; boundaryCursor: string | null }> {
  const events: any[] = [];
  let cursor: string | null = null;
  let pages = 0;

  do {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (opts.vendor && opts.vendor !== "all") params.set("vendor", opts.vendor);
    if (cursor) params.set("cursor", cursor);

    const body = await fetchUpstreamJson(env, params.toString());
    const page = body.data.map(normalizeEvent);
    events.push(...page);
    if (opts.onPage) opts.onPage(page);

    cursor = body.next_cursor ?? null;
    pages++;
  } while (
    cursor &&
    pages < MAX_UPSTREAM_PAGES &&
    (opts.collectCap === undefined || events.length < opts.collectCap)
  );

  return { events, complete: cursor === null, pages, boundaryCursor: cursor };
}

/* ── High-water-mark (HWM) ID guard ──
 * Safety invariant: upstream ids are allocated monotonically and the
 * list endpoint enumerates newest-first, so an EXHAUSTIVE cursor walk
 * that reached high-water mark H has seen every row with id ≤ H. Any
 * absent id ≤ H never existed and can be rejected forever; any id > H
 * may have been created after the scan and MUST fall through to a real
 * lookup — this is what makes false 404s for newly created listings
 * structurally impossible. Deletions rejecting as 404 is the desired
 * behavior anyway. The TTL only bounds the exotic case of someone
 * manually inserting an id below the sequence. */

const ID_INDEX_KEY = "https://voucherbot.internal/__opportunity-hwm-index";

interface HwmIndex {
  hwm: number;
  ids: number[];
  exhaustive: boolean;
  savedAt: number;
}

async function readHwmIndex(): Promise<HwmIndex | null> {
  try {
    const cached = await caches.default.match(new Request(ID_INDEX_KEY));
    if (!cached) return null;
    const body = await cached.json<HwmIndex>();
    if (!body || typeof body.hwm !== "number" || !Array.isArray(body.ids)) return null;
    return body;
  } catch {
    return null;
  }
}

/** Record the outcome of a walk. Only naturally-exhausted walks carry
 * absence proof for their covered range; partial (early-exit or
 * ceiling-stopped) walks are discarded — they prove nothing about the
 * rows they never read. Never regresses below an existing exhaustive
 * high-water mark. */
export async function noteWalkOutcome(pagesRows: any[][], exhaustive: boolean): Promise<void> {
  if (!exhaustive) return;
  try {
    const flat = pagesRows.flat();
    if (!flat.length) return;
    const ids = flat.map((e) => e.id);
    const hwm = Math.max(...ids);

    // Never regress below an existing exhaustive high-water mark.
    const existing = await readHwmIndex();
    if (existing && existing.exhaustive && existing.hwm >= hwm) return;

    const res = new Response(
      JSON.stringify({ hwm, ids, exhaustive: true, savedAt: Date.now() }),
      { headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${ID_INDEX_TTL_MS / 1000}` } }
    );
    await caches.default.put(new Request(ID_INDEX_KEY), res);
  } catch {
    // Index maintenance must never break the route that fed it.
  }
}

/** Locate one opportunity (+ up to DETAIL_RELATED_TARGET same-vendor
 * peers) with early exit. Isolates today's list-scan lookup behind a
 * single seam: swap in a future single-item endpoint here without
 * touching any route handler. */
export async function findOpportunityById(
  env: any,
  id: number
): Promise<{ status: "found" | "not-found" | "unavailable"; item?: any; related?: any[] }> {
  // Guard fast path — safe by construction: reject only ids inside the
  // proven-covered range of a fresh, exhaustive scan.
  const index = await readHwmIndex();
  if (
    index &&
    index.exhaustive &&
    Date.now() - index.savedAt <= ID_INDEX_TTL_MS &&
    id <= index.hwm &&
    !index.ids.includes(id)
  ) {
    return { status: "not-found" };
  }

  // Slow path: walk pages until the id appears (early exit), buffering
  // scanned rows so same-vendor related links stay high-quality.
  const scannedPages: any[][] = [];
  let cursor: string | null = null;
  let pages = 0;
  let found = false;

  try {
    do {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (cursor) params.set("cursor", cursor);
      const body = await fetchUpstreamJson(env, params.toString());
      const page = body.data.map(normalizeEvent);
      scannedPages.push(page);
      if (page.some((e) => e.id === id)) found = true;

      cursor = body.next_cursor ?? null;
      pages++;
    } while (cursor && pages < MAX_UPSTREAM_PAGES && !found);

    // A naturally-exhausted walk proves absence for everything it
    // covered; publish that proof. Early exits prove nothing about
    // unread rows, so partial walks update nothing.
    if (!cursor && pages < MAX_UPSTREAM_PAGES) {
      noteWalkOutcome(scannedPages, true).catch(() => {});
    }

    if (!found) return { status: "not-found" };

    const flat = scannedPages.flat();
    const item = flat.find((e) => e.id === id)!;
    const related = item.vendor
      ? flat.filter((e) => e.id !== id && e.vendor === item.vendor).slice(0, DETAIL_RELATED_TARGET)
      : [];
    return { status: "found", item, related };
  } catch (err) {
    return { status: "unavailable" };
  }
}
