const API_BASE = "/v1/api";

export async function getEvents({ search, vendor, sort, limit = 100, cursor } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (vendor && vendor !== "all") params.set("vendor", vendor);
  if (sort && sort !== "newest") params.set("sort", sort);
  if (limit !== 100) params.set("limit", limit);
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(`${API_BASE}/events?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("API returned unsuccessful response");
  }

  return { events: body.data, nextCursor: body.next_cursor };
}

let vendorsCache = null;

export async function getVendors() {
  if (vendorsCache) return vendorsCache;

  const response = await fetch(`${API_BASE}/vendors`);

  if (!response.ok) {
    throw new Error(`Failed to fetch vendors: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error("API returned unsuccessful response for vendors");
  }

  vendorsCache = body.data;
  return vendorsCache;
}
