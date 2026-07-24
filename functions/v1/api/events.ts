const CACHE_TTL = 900; // 15 minutes

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const cacheHeaders = {
  "Cache-Control": `public, s-maxage=${CACHE_TTL}, max-age=0, must-revalidate`,
};

/* ── Rate limiting ──
 * Per-IP counter stored in a Map. Because Workers isolates are not shared,
 * this is approximate under concurrent isolates. The generous limit of 60
 * requests per minute makes this acceptable for the preview site.
 * Stale entries are purged lazily during each check. */
const WINDOW_MS = 60_000;
const MAX_RPM = 60;
const ipCounters = new Map();

function getClientIP(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  for (const [key, entry] of ipCounters) {
    if (now - entry.start > WINDOW_MS) ipCounters.delete(key);
  }
  let entry = ipCounters.get(ip);
  if (!entry) {
    entry = { start: now, count: 0 };
    ipCounters.set(ip, entry);
  }
  entry.count++;
  return entry.count <= MAX_RPM;
}

/* ── Handler ── */

export async function onRequestGet({ request, env }) {
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
        ...corsHeaders,
      },
    });
  }

  // Check edge cache before contacting Supabase
  const cacheKey = new Request(request.url, request);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  try {
    const requestUrl = new URL(request.url);
    const upstreamUrl = env.SUPABASE_FUNCTION_URL + requestUrl.search;

    const response = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-function-secret": env.FUNCTION_SECRET,
        apikey: env.SUPABASE_PUBLISHABLE_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Upstream error", details: data }), {
        status: response.status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = JSON.stringify(data);
    const cacheable = new Response(body, {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders, ...cacheHeaders },
    });

    // Store in edge cache before returning
    await caches.default.put(cacheKey, cacheable.clone());
    return cacheable;
  } catch (err) {
    return new Response(JSON.stringify({ error: "Worker error", message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
