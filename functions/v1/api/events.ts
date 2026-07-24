const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/* Edge-cache successful 200 responses for 15 minutes. */
const cacheHeaders = {
  "Cache-Control": "public, s-maxage=900, max-age=0, must-revalidate",
};

/* ── Rate limiting ──
 * Per-IP counter stored in a Map.  Because Workers isolates are not shared,
 * this is approximate under concurrent isolates.  The generous limit of 60
 * requests per minute makes this acceptable for the preview site.
 * Stale entries are purged every 60 seconds. */
const WINDOW_MS = 60_000;
const MAX_RPM = 60;
const ipCounters = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipCounters) {
    if (now - entry.start > WINDOW_MS) ipCounters.delete(ip);
  }
}, WINDOW_MS);

function getClientIP(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  let entry = ipCounters.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
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

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders, ...cacheHeaders },
    });
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
