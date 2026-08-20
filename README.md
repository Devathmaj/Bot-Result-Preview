# VoucherBot — Web Frontend

The web frontend for [Voucher Bot](https://github.com/Devathmaj/VoucherBot) — an open-source
project that automatically discovers certification discounts, free exam opportunities, and
training promotions from vendor sites, training providers, and community sources.

> **Live site:** [https://voucherbot-preview.pages.dev/](https://voucherbot-preview.pages.dev/)

## What this site does

- **Server-rendered opportunity feed** — the homepage ships with real listing content in the
  initial HTML (titles, summaries, vendors, sources, AI assessment). No JavaScript is required
  to browse or get found by search engines.
- **Individual opportunity pages** (`/opportunities/{id}`) and **vendor listing pages**
  (`/vendors/{slug}`) — all server-rendered, all included in a dynamic `sitemap.xml`.
- **Instant search & filters** — multi-field search (titles, summaries, vendors) plus vendor,
  discovery-window, and AI-confidence filters run client-side over the loaded dataset, so they
  respond instantly. Filters are shareable through URL parameters (`/?q=aws&vendor=microsoft`).
- **Notifications** — new listings can be pushed to Discord or Telegram the moment they are
  discovered. See the [Set Up Notifications](https://voucherbot-preview.pages.dev/#notifications)
  page.
- **Light/dark theme**, responsive layout, and an accessible modal-based "How it works" guide —
  with no frameworks and no build step for the frontend code.

## Architecture

The data pipeline is intentional and unchanged:

```
Cloudflare Pages Function  →  Supabase Edge Function  →  Supabase
```

HTML routes (`/`, `/opportunities/{id}`, `/vendors/{slug}`, `/sitemap.xml`) are rendered
server-side by Pages Functions that call the same Supabase Edge Function the JSON API uses,
then edge-cache the result. Interactive filtering, search, and pagination continue on the
client through the JSON proxy endpoints (`/v1/api/events`, `/v1/api/vendors`).

## Project structure

| Path | Purpose |
|---|---|
| `functions/index.ts` | Server-rendered homepage |
| `functions/opportunities/[id].ts` | Server-rendered opportunity detail pages |
| `functions/vendors/[vendor].ts` | Server-rendered vendor listing pages |
| `functions/sitemap.xml.ts` | Dynamic sitemap generated from live data |
| `functions/v1/api/*` | JSON proxy endpoints (rate-limited, edge-cached) |
| `functions/_shared/layout.ts` | Shared document shell, pagination assembly, upstream helpers |
| `js/components/*` | UI builders shared by the server render and the client |
| `js/pages/*` | Legal pages and the notifications setup page |
| `js/ui.js` | Homepage orchestrator: hydration, search, filters, pagination |
| `js/config.js` | Dataset-scale constants (page size, SSR thresholds) |
| `style.css` | Full custom stylesheet (light/dark themes) |

## Local development

```bash
npx wrangler pages dev . --port 8791
```

Create a `.dev.vars` file with:

```
SUPABASE_FUNCTION_URL=https://<project>.supabase.co/functions/v1/<function>
FUNCTION_SECRET=<shared secret>
SUPABASE_PUBLISHABLE_KEY=<anon key>
```

Optional tooling:

```bash
node scripts/check-imports.mjs   # validates the client ES-module import graph
node scripts/mock-sef.mjs 100    # local mock of the upstream for scale testing
```

## Notifications

Voucher Bot can push new listings to **Discord** or **Telegram** as they are discovered.
Setup instructions live on the [Notifications](https://voucherbot-preview.pages.dev/#notifications)
page. The notification module has its own Privacy Policy, Terms of Service, and Disclaimer,
linked from every site legal page and from the setup page.

## Disclaimer

Voucher Tracker is an independent, open-source aggregator. Listings are identified through
automated analysis, may be incomplete or outdated, and are not endorsements. Always confirm
details with the issuing organization. See the full
[Disclaimer](https://voucherbot-preview.pages.dev/#disclaimer) on the site.
