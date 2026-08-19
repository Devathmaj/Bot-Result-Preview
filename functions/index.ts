import { renderSiteHeader } from "../js/components/site-header.js";
import { renderSiteFooter } from "../js/components/site-footer.js";
import { renderHero } from "../js/components/hero.js";
import { renderFilterBar } from "../js/components/filter-bar.js";
import { renderOpportunityCard } from "../js/components/opportunity-card.js";
import { renderHowItWorks } from "../js/components/how-it-works.js";
import { renderNotificationCta } from "../js/components/notification-cta.js";
import {
  htmlHeaders,
  jsonLdScript,
  fetchUpstreamJson,
  serveWithCache,
  SITE_URL,
  sortByCreatedDesc,
  renderDocument,
} from "./_shared/layout.ts";
import { countByVendor, normalizeEvent } from "../js/utils.js";

/* ── Server-rendered homepage ──
 * Serves "/" with real opportunity content in the initial HTML.
 * Data path is unchanged: this function calls the same Supabase Edge
 * Function endpoint that /v1/api/events proxies to, using the same
 * secrets. Page sections are imported from the same component modules
 * the client uses, so server and client emit identical markup. */

const UPSTREAM_LIMIT = 100;

function renderInitialDataScript(payload) {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return `<script>window.__INITIAL_DATA__=${json};</script>`;
}

function itemListLd(events) {
  return jsonLdScript({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: events.slice(0, 25).map((event, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: event.title,
      url: `${SITE_URL}/opportunities/${event.id}`,
    })),
  });
}

function renderHomeBody(payload) {
  const grid = payload.ok
    ? payload.events.map((event) => renderOpportunityCard(event)).join("\n")
    : "";
  const vendorCounts = payload.ok ? countByVendor(payload.events) : {};

  return `
  ${renderSiteHeader()}
  ${renderHero(payload.vendors, vendorCounts)}
  <div class="container">
    <div data-filter-slot>${renderFilterBar(payload.vendors)}</div>
    <section class="feed-section" id="feed" aria-label="Latest certification opportunities" tabindex="-1">
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
  <noscript>
    <div style="max-width:680px;margin:4rem auto;font-family:sans-serif;line-height:1.6;padding:0 1rem;text-align:center">
      <p>All currently tracked opportunities are listed above on this page.</p>
      <p>Please enable JavaScript to search, filter, and sort the listings.</p>
    </div>
  </noscript>`;
}

/* ── Handler ──
 * No per-IP rate limiting on this route: unlike the JSON endpoints,
 * it serves cacheable HTML requested once per navigation; the edge
 * cache plus upstream protections are sufficient. */

export async function onRequestGet({ request, env }) {
  return serveWithCache(request, async () => {
    const results = await Promise.allSettled([
      fetchUpstreamJson(env, `?limit=${UPSTREAM_LIMIT}`),
      fetchUpstreamJson(env, "?mode=vendors"),
    ]);

    const ok = results[0].status === "fulfilled";
    const payload = {
      ok,
      events: ok ? sortByCreatedDesc(results[0].value.data).map(normalizeEvent) : [],
      nextCursor: ok ? (results[0].value.next_cursor ?? null) : null,
      vendors:
        results[1].status === "fulfilled"
          ? results[1].value.data
          : null,
    };

    const scripts = `
  ${jsonLdScript(WEBSITE_SCHEMA)}
  ${ok ? itemListLd(payload.events) : ""}`;

    const extraHeadRaw = `
  <!-- Google Verification -->
  <meta name="google-site-verification" content="pY4bmDvqorvsJGb91YVy7qL-eeSw1fwb-L8usvSn5Ws">`;

    const body = `${renderHomeBody(payload)}
  ${renderInitialDataScript(payload)}`;

    const html = renderDocument({
      path: "/",
      title: "VoucherBot — Certification Discounts & Opportunities",
      description:
        "Discover certification exam discounts, free exam vouchers, beta exams, and training promotions — collected automatically from vendor sites, training providers, and community sources.",
      body,
      scripts,
      extraHeadRaw,
      entryScript: "/js/ui.js",
    });

    return new Response(html, { headers: htmlHeaders() });
  });
}

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VoucherBot",
  url: `${SITE_URL}/`,
  description:
    "A discovery platform for certification discounts and opportunities, collected automatically from public sources.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};
