/* ── Dataset-scale configuration (single source of truth) ──
 * The upstream Supabase Edge Function clamps every page to 100 rows
 * (verified live: requesting 250/500/1000 echoes limit=100), so any
 * dataset larger than PAGE_SIZE must be assembled through cursor
 * pagination. All consumers import these values; no component may
 * hardcode its own opportunity-fetch limit. */

/** Rows per upstream request. 100 is the backend's proven maximum. */
export const PAGE_SIZE = 100;

/** Hard ceiling on pagination rounds per assembly, bounding worst-case
 * upstream work per render (50 × 100 = 5,000 opportunities). */
export const MAX_UPSTREAM_PAGES = 50;

/** Datasets up to this size server-render ALL opportunity cards on the
 * homepage, preserving today's full-feed behavior. Above it, only the
 * newest SSR_CARD_LIMIT cards are rendered and older items remain
 * discoverable via detail pages, sitemap, and ItemList. */
export const SSR_FULL_FEED_MAX = 60;

/** Newest cards rendered when the dataset exceeds SSR_FULL_FEED_MAX. */
export const SSR_CARD_LIMIT = 12;

/** Opportunities embedded in the homepage hydration payload. Complete
 * for datasets up to this size (instant client-side search/filter over
 * everything); beyond it the payload carries a cursor and the client
 * pulls remaining pages in the background to stay search-complete. */
export const EMBED_EVENT_LIMIT = 250;

/** Same-vendor links collected on an opportunity detail page. */
export const DETAIL_RELATED_TARGET = 3;

