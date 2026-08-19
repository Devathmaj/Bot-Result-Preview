import { renderSiteHeader } from "../../js/components/site-header.js";
import { renderSiteFooter } from "../../js/components/site-footer.js";
import { renderNotificationCta } from "../../js/components/notification-cta.js";
import { renderOpportunityDetail, renderRelatedSection } from "../../js/components/opportunity-detail.js";
import { renderMessagePage } from "../../js/components/page-shells.js";
import { normalizeEvent } from "../../js/utils.js";
import {
  htmlHeaders,
  jsonLdScript,
  breadcrumbLd,
  fetchUpstreamJson,
  serveWithCache,
  renderDocument,
} from "../_shared/layout.ts";

/* ── Server-rendered individual opportunity page ──
 * /opportunities/{id}
 * Uses the same shared component modules as the client. Data comes
 * from the existing Supabase Edge Function via the same secrets; there
 * is no single-item endpoint, so the current listing set is fetched
 * and the requested id is selected server-side. */

const UPSTREAM_LIMIT = 100;

function notFound() {
  return new Response(
    renderDocument({
      path: "/opportunities",
      title: "Listing not found — VoucherBot",
      robots: false,
      body:
        renderSiteHeader() +
        renderMessagePage("Listing not found", "<p>This listing may have been removed or the address is incorrect.</p>") +
        renderSiteFooter(),
    }),
    { status: 404, headers: htmlHeaders(60) }
  );
}

export async function onRequestGet({ request, env, params }) {
  return serveWithCache(request, async () => {
    const rawId = params.id ? decodeURIComponent(params.id) : "";
    const id = Number(rawId);
    if (!rawId || !Number.isInteger(id) || id <= 0) return notFound();

    let data;
    try {
      data = await fetchUpstreamJson(env, `?limit=${UPSTREAM_LIMIT}`);
    } catch (err) {
      return new Response(
        renderDocument({
          path: request.url ? new URL(request.url).pathname : "/opportunities",
          title: "Listing unavailable — VoucherBot",
          robots: false,
          body:
            renderSiteHeader() +
            renderMessagePage("Listing unavailable", "<p>The listing service did not respond. Please try again shortly.</p>") +
            renderSiteFooter(),
        }),
        { status: 503, headers: htmlHeaders() }
      );
    }

    const allEvents = data.data.map(normalizeEvent);
    const item = allEvents.find((e) => e.id === id);
    if (!item) return notFound();

    const related = item.vendor
      ? allEvents.filter((e) => e.id !== item.id && e.vendor === item.vendor).slice(0, 3)
      : [];

    const summaryText = (item.summary || item.ai_result?.promotion_name || item.title || "Certification opportunity listing").slice(0, 155);

    const crumbs = [
      { name: "Home", path: "/" },
      ...(item.vendor ? [{ name: item.vendor.replace(/\b\w/g, (c) => c.toUpperCase()), path: `/vendors/${item.vendor.replace(/\s+/g, "-")}` }] : []),
      { name: item.title || `Listing ${item.id}` },
    ];

    const scripts = `
  ${jsonLdScript(breadcrumbLd(crumbs))}`;

    const body =
      renderSiteHeader() +
      renderOpportunityDetail(item) +
      renderRelatedSection(related, item.vendor || "") +
      renderNotificationCta() +
      renderSiteFooter();

    const html = renderDocument({
      path: `/opportunities/${item.id}`,
      title: `${item.title || "Certification opportunity"} — VoucherBot`,
      description: summaryText,
      ogType: "article",
      body,
      scripts,
    });

    return new Response(html, { headers: htmlHeaders() });
  });
}
