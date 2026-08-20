import { renderSiteHeader } from "../../js/components/site-header.js";
import { renderSiteFooter } from "../../js/components/site-footer.js";
import { renderHowItWorks } from "../../js/components/how-it-works.js";
import { renderNotificationCta } from "../../js/components/notification-cta.js";
import { renderVendorPage } from "../../js/components/vendor-page.js";
import { renderMessagePage } from "../../js/components/page-shells.js";
import { vendorLabel, vendorSlug } from "../../js/utils.js";
import {
  htmlHeaders,
  jsonLdScript,
  breadcrumbLd,
  fetchUpstreamJson,
  fetchAllOpportunities,
  serveWithCache,
  sortByCreatedDesc,
  renderDocument,
} from "../_shared/layout.ts";
import { SSR_FULL_FEED_MAX, SSR_CARD_LIMIT } from "../../js/config.js";

/* ── Server-rendered vendor listing page ──
 * /vendors/{vendor-slug}
 * The slug is validated against the live vendors list; listings are
 * fetched through the existing Supabase Edge Function (?vendor=). */

export async function onRequestGet({ request, env, params }) {
  return serveWithCache(request, async () => {
    let vendorsResult;
    let eventsResult;
    try {
      const vendorsPromise = fetchUpstreamJson(env, "?mode=vendors");
      const feed = await fetchAllOpportunities(env, {});
      vendorsResult = await vendorsPromise;
      eventsResult = { data: feed.events };
    } catch (err) {
      return new Response(
        renderDocument({
          path: "/vendors",
          title: "Listings unavailable — VoucherBot",
          robots: false,
          body:
            renderSiteHeader() +
            renderMessagePage("Listings unavailable", "<p>The listing service did not respond. Please try again shortly.</p>") +
            renderSiteFooter(),
        }),
        { status: 503, headers: htmlHeaders() }
      );
    }

    const vendors = vendorsResult.data.map((v) => v.vendor);
    const rawSlug = params.vendor ? decodeURIComponent(params.vendor).toLowerCase() : "";
    const vendor = vendors.find((v) => vendorSlug(v) === rawSlug);

    if (!vendor) {
      return new Response(
        renderDocument({
          path: request.url ? new URL(request.url).pathname : "/vendors",
          title: "Vendor not found — VoucherBot",
          robots: false,
          body:
            renderSiteHeader() +
            renderMessagePage("Vendor not found", "<p>No listings are tracked for this vendor.</p>") +
            renderSiteFooter(),
        }),
        { status: 404, headers: htmlHeaders(60) }
      );
    }

    const allForVendor = sortByCreatedDesc(eventsResult.data.filter((e) => e.vendor === vendor));
    const renderCount = allForVendor.length <= SSR_FULL_FEED_MAX ? allForVendor.length : Math.min(SSR_CARD_LIMIT, allForVendor.length);
    const events = allForVendor.slice(0, renderCount);
    const name = vendorLabel(vendor);
    const vendorPath = `/vendors/${encodeURIComponent(vendorSlug(vendor))}`;

    const scripts = `
  ${jsonLdScript(breadcrumbLd([{ name: "Home", path: "/" }, { name: name }]))}`;

    const body =
      renderSiteHeader() +
      renderVendorPage(vendor, events, events.length) +
      renderHowItWorks() +
      renderNotificationCta() +
      renderSiteFooter();

    const html = renderDocument({
      path: vendorPath,
      title: `${name} certification discounts & opportunities — VoucherBot`,
      description: `${events.length || "No"} certification opportunit${events.length === 1 ? "y" : "ies"} from ${name}, collected automatically and shown as discovered.`,
      body,
      scripts,
    });

    return new Response(html, { headers: htmlHeaders() });
  });
}
