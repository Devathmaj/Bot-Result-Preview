const CACHE_TTL = 14400; // 4 hours

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const cacheHeaders = {
  "Cache-Control": `public, s-maxage=${CACHE_TTL}, max-age=0, must-revalidate`,
};

/* ── Rate limiting ──
 * Per-IP counter stored in a Map. Per-isolate only; generous limit of 30
 * requests per minute keeps this acceptable for a preview site.
 * Stale entries are purged lazily during each check. */
const WINDOW_MS = 60_000;
const MAX_RPM = 30;
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
  if (cached) {
    console.log("Cache HIT");
    const headers = new Headers(cached.headers);
    headers.set("X-Worker-Cache", "HIT");
    return new Response(cached.body, { status: cached.status, statusText: cached.statusText, headers });
  }

  try {
    const upstreamUrl = env.SUPABASE_FUNCTION_URL + "?mode=vendors";

    console.log("Cache MISS - calling Supabase");
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
      headers: { "Content-Type": "application/json", "X-Worker-Cache": "MISS", ...corsHeaders, ...cacheHeaders },
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
