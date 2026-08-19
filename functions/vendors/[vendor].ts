import { renderSiteHeader } from "../../js/components/site-header.js";
import { renderSiteFooter } from "../../js/components/site-footer.js";
import { renderHowItWorks } from "../../js/components/how-it-works.js";
import { renderNotificationCta } from "../../js/components/notification-cta.js";
import { renderVendorPage } from "../../js/components/vendor-page.js";
import { renderMessagePage } from "../../js/components/page-shells.js";
import { vendorLabel, vendorSlug } from "../../js/utils.js";

/* ── Server-rendered vendor listing page ──
 * /vendors/{vendor-slug}
 * The slug is validated against the live vendors list; listings are
 * fetched through the existing Supabase Edge Function (?vendor=). */

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

let currentPath = "/";

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
  <meta property="og:type" content="website">
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

export async function onRequestGet({ request, env, params }) {
  const cacheKey = new Request(request.url);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const url = new URL(request.url);
  currentPath = url.pathname;

  let results;
  try {
    results = await Promise.allSettled([
      fetchUpstream(env, "?mode=vendors"),
      fetchUpstream(env, `?limit=${UPSTREAM_LIMIT}`),
    ]);
  } catch (err) {
    results = [{ status: "rejected" }, { status: "rejected" }];
  }

  if (results[0].status !== "fulfilled" || results[1].status !== "fulfilled") {
    return new Response(
      pageShell(
        renderSiteHeader() +
          renderMessagePage("Listings unavailable", "<p>The listing service did not respond. Please try again shortly.</p>") +
          renderSiteFooter(),
        "Listings unavailable — VoucherBot"
      ),
      { status: 503, headers: htmlHeaders }
    );
  }

  const vendors = results[0].value.data.map((v) => v.vendor);
  const rawSlug = params.vendor ? decodeURIComponent(params.vendor) : "";
  const vendor = vendors.find((v) => vendorSlug(v) === rawSlug.toLowerCase());

  if (!vendor) {
    return new Response(
      pageShell(
        renderSiteHeader() +
          renderMessagePage("Vendor not found", "<p>No listings are tracked for this vendor.</p>") +
          renderSiteFooter(),
        "Vendor not found — VoucherBot"
      ),
      { status: 404, headers: { ...htmlHeaders, "Cache-Control": "public, s-maxage=60, max-age=0, must-revalidate" } }
    );
  }

  const events = sortByCreatedDesc(results[1].value.data.filter((e) => e.vendor === vendor));
  const name = vendorLabel(vendor);

  const inner =
    renderSiteHeader() +
    renderVendorPage(vendor, events, events.length) +
    renderHowItWorks() +
    renderNotificationCta() +
    renderSiteFooter();

  const title = `${name} certification discounts & opportunities — VoucherBot`;
  const description = `${events.length || "No"} certification opportunit${events.length === 1 ? "y" : "ies"} from ${name}, collected automatically and shown as discovered.`;

  const response = new Response(pageShell(inner, title, description), { headers: htmlHeaders });
  await caches.default.put(cacheKey, response.clone());
  return response;
}

function sortByCreatedDesc(list) {
  return [...list].sort((a, b) => (b?.created_at ? Date.parse(b.created_at) : 0) - (a?.created_at ? Date.parse(a.created_at) : 0));
}
