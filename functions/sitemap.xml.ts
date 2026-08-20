import { fetchUpstreamJson, fetchAllOpportunities, serveWithCache, SITE_URL } from "./_shared/layout.ts";
import { vendorSlug } from "../js/utils.js";

/* ── Dynamic sitemap ──
 * /sitemap.xml — generated from live data so every real opportunity
 * URL and vendor page is discoverable without a build step. */

function xmlEscape(str) {
  if (typeof str !== "string") return str ?? "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function onRequestGet({ request, env }) {
  return serveWithCache(
    request,
    async () => {
      const urls = [{ loc: `${SITE_URL}/`, changefreq: "hourly", priority: "1.0" }];

      try {
        const vendorsPromise = fetchUpstreamJson(env, "?mode=vendors");
        const feedPromise = fetchAllOpportunities(env, {});
        const [vendorsResult, eventsResult] = await Promise.all([vendorsPromise, feedPromise]);

        for (const v of vendorsResult.data) {
          urls.push({
            loc: `${SITE_URL}/vendors/${vendorSlug(v.vendor)}`,
            changefreq: "daily",
            priority: "0.7",
          });
        }

        for (const event of eventsResult.events) {
          urls.push({
            loc: `${SITE_URL}/opportunities/${event.id}`,
            lastmod: event.created_at ? event.created_at.slice(0, 10) : undefined,
            changefreq: "weekly",
            priority: "0.8",
          });
        }
      } catch (err) {
        // On upstream failure, emit the static entries only.
      }

      const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`)
  .join("\n")}
</urlset>`;

      return new Response(body, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, s-maxage=3600, max-age=0, must-revalidate",
        },
      });
    },
    3600
  );
}
