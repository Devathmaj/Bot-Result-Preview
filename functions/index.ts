import { renderSiteHeader } from "../js/components/site-header.js";
import { renderSiteFooter } from "../js/components/site-footer.js";
import { renderHero } from "../js/components/hero.js";
import { renderFilterBar } from "../js/components/filter-bar.js";
import { renderOpportunityCard } from "../js/components/opportunity-card.js";
import { renderHowItWorks } from "../js/components/how-it-works.js";
import { renderNotificationCta } from "../js/components/notification-cta.js";

/* ── Server-rendered homepage ──
 * Serves "/" with real opportunity content in the initial HTML.
 * Data path is unchanged: this function calls the same Supabase Edge
 * Function endpoint that /v1/api/events proxies to, using the same
 * secrets. Page sections are imported from the same component modules
 * the client uses, so server and client emit identical markup. */

const CACHE_TTL = 300;
const UPSTREAM_LIMIT = 100;

const htmlHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": `public, s-maxage=${CACHE_TTL}, max-age=0, must-revalidate`,
};

function createdAtMs(event) {
  return event?.created_at ? Date.parse(event.created_at) : 0;
}

function sortByCreatedDesc(list) {
  return [...list].sort((a, b) => createdAtMs(b) - createdAtMs(a));
}

async function fetchUpstream(env, queryString) {
  const response = await fetch(env.SUPABASE_FUNCTION_URL + queryString, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-function-secret": env.FUNCTION_SECRET,
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Upstream error: ${response.status}`);
  }

  const body = await response.json();
  if (!body?.success || !Array.isArray(body.data)) {
    throw new Error("Unexpected upstream envelope");
  }
  return body;
}

function renderHead() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta -->
  <title>VoucherBot — Certification Discounts & Opportunities</title>
  <meta name="description" content="Discover certification exam discounts, free exam vouchers, beta exams, and training promotions — collected automatically from vendor sites, training providers, and community sources.">
  <meta name="author" content="VoucherBot">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://voucherbot-preview.pages.dev/">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://voucherbot-preview.pages.dev/">
  <meta property="og:title" content="VoucherBot — Certification Discounts & Opportunities">
  <meta property="og:description" content="Exam discounts, free exam offers, beta exams, and training promotions — listed here as they are discovered.">
  <meta property="og:site_name" content="VoucherBot">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="VoucherBot — Certification Discounts & Opportunities">
  <meta name="twitter:description" content="Exam discounts, free exam offers, beta exams, and training promotions — listed here as they are discovered.">
  <meta name="twitter:url" content="https://voucherbot-preview.pages.dev/">

  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VoucherBot",
    "url": "https://voucherbot-preview.pages.dev/",
    "description": "A discovery platform for certification discounts and opportunities, collected automatically from public sources.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://voucherbot-preview.pages.dev/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
  </script>

  <!-- Google Verification -->
  <meta name="google-site-verification" content="pY4bmDvqorvsJGb91YVy7qL-eeSw1fwb-L8usvSn5Ws">

  <!-- Apply stored or system theme before first paint -->
  <script>(function(){try{var t=localStorage.getItem("voucherbot:theme");if(t!=="light"&&t!=="dark"){t=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>

  <!-- Favicon & Fonts -->
  <link rel="icon" href="/assets/favicon.ico" type="image/x-icon">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;450;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
</head>
`;
}

function renderInitialDataScript(payload) {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return `<script>window.__INITIAL_DATA__=${json};</script>`;
}

function renderHome(payload) {
  const grid = payload.ok
    ? payload.events.map((event) => renderOpportunityCard(event)).join("\n")
    : "";

  return `${renderHead()}
<body>
  <main id="app">
  ${renderSiteHeader()}
  ${renderHero(payload.vendors)}
  <div class="container">
    <div data-filter-slot>${renderFilterBar(payload.vendors)}</div>
    <section class="feed-section" id="feed" aria-label="Latest certification opportunities">
      <div class="feed-head">
        <h2 class="section-heading">Latest opportunities</h2>
        <span class="results-count" id="results-count" aria-live="polite"></span>
      </div>
      <div id="feed-status"><div class="card-grid" id="card-grid">
${grid}
      </div></div>
      <nav class="pagination" id="pagination" aria-label="Listings pages"></nav>
    </section>
  </div>
  ${renderHowItWorks()}
  ${renderNotificationCta()}
  ${renderSiteFooter()}
  </main>
  <noscript>
    <div style="max-width:680px;margin:4rem auto;font-family:sans-serif;line-height:1.6;padding:0 1rem;text-align:center">
      <p>All currently tracked opportunities are listed above on this page.</p>
      <p>Please enable JavaScript to search, filter, and sort the listings.</p>
    </div>
  </noscript>
  ${renderInitialDataScript(payload)}
  <script type="module" src="/js/ui.js"></script>
</body>
</html>`;
}

/* ── Handler ──
 * No per-IP rate limiting on this route: unlike the JSON endpoints,
 * it serves cacheable HTML requested once per navigation; the edge
 * cache plus upstream protections are sufficient. */

export async function onRequestGet({ request, env }) {
  const cacheKey = new Request(request.url);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const results = await Promise.allSettled([
    fetchUpstream(env, `?limit=${UPSTREAM_LIMIT}`),
    fetchUpstream(env, "?mode=vendors"),
  ]);

  const ok = results[0].status === "fulfilled";
  const payload = {
    ok,
    events: ok ? sortByCreatedDesc(results[0].value.data) : [],
    nextCursor: ok ? (results[0].value.next_cursor ?? null) : null,
    vendors:
      results[1].status === "fulfilled"
        ? results[1].value.data
        : null,
  };

  const response = new Response(renderHome(payload), { headers: htmlHeaders });

  if (ok) {
    await caches.default.put(cacheKey, response.clone());
  }
  return response;
}
