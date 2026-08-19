import { renderSiteHeader } from "../../js/components/site-header.js";
import { renderSiteFooter } from "../../js/components/site-footer.js";
import { renderHowItWorks } from "../../js/components/how-it-works.js";
import { renderNotificationCta } from "../../js/components/notification-cta.js";
import { renderOpportunityDetail, renderRelatedSection } from "../../js/components/opportunity-detail.js";
import { renderMessagePage } from "../../js/components/page-shells.js";

/* ── Server-rendered individual opportunity page ──
 * /opportunities/{id}
 * Uses the same shared component modules as the client. Data comes
 * from the existing Supabase Edge Function via the same secrets; there
 * is no single-item endpoint, so the current listing set is fetched and
 * the requested id is selected server-side. */

const CACHE_TTL = 300;
const UPSTREAM_LIMIT = 100;

const htmlHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": `public, s-maxage=${CACHE_TTL}, max-age=0, must-revalidate`,
};

function escapeHtml(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function pageShell(innerHtml, title, description) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ""}
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://voucherbot-preview.pages.dev${escapeHtml(currentPath)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="VoucherBot">
  <meta property="og:title" content="${escapeHtml(title)}">

  <script>(function(){try{var t=localStorage.getItem("voucherbot:theme");if(t!=="light"&&t!=="dark"){t=(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>

  <link rel="icon" href="/assets/favicon.ico" type="image/x-icon">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;450;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <main id="app">
  ${innerHtml}
  </main>
  <script type="module" src="/js/detail.js"></script>
</body>
</html>`;
}

let currentPath = "/";

async function fetchUpstream(env, queryString) {
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

function notFound() {
  return new Response(
    pageShell(
      renderSiteHeader() +
        renderMessagePage("Listing not found", "<p>This listing may have been removed or the address is incorrect.</p>") +
        renderSiteFooter(),
      "Listing not found — VoucherBot"
    ),
    { status: 404, headers: { ...htmlHeaders, "Cache-Control": "public, s-maxage=60, max-age=0, must-revalidate" } }
  );
}

export async function onRequestGet({ request, env, params }) {
  const cacheKey = new Request(request.url);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const url = new URL(request.url);
  currentPath = url.pathname;

  const rawId = params.id ? decodeURIComponent(params.id) : "";
  const id = Number(rawId);
  if (!rawId || !Number.isInteger(id) || id <= 0) return notFound();

  let data;
  try {
    data = await fetchUpstream(env, `?limit=${UPSTREAM_LIMIT}`);
  } catch (err) {
    return new Response(
      pageShell(
        renderSiteHeader() +
          renderMessagePage("Listing unavailable", "<p>The listing service did not respond. Please try again shortly.</p>") +
          renderSiteFooter(),
        "Listing unavailable — VoucherBot"
      ),
      { status: 503, headers: htmlHeaders }
    );
  }

  const item = data.data.find((e) => e.id === id);
  if (!item) return notFound();

  const related = item.vendor
    ? data.data.filter((e) => e.id !== item.id && e.vendor === item.vendor).slice(0, 3)
    : [];

  const summaryText =
    (item.summary || item.ai_result?.promotion_name || item.title || "").slice(0, 155);

  const inner =
    renderSiteHeader() +
    renderOpportunityDetail(item) +
    renderRelatedSection(related, item.vendor || "") +
    renderNotificationCta() +
    renderSiteFooter();

  const title = `${item.title || "Certification opportunity"} — VoucherBot`;
  const response = new Response(pageShell(inner, title, summaryText), { headers: htmlHeaders });
  await caches.default.put(cacheKey, response.clone());
  return response;
}
