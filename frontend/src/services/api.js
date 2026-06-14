// The ONLY network module on the frontend. Components import named functions
// from here — never call fetch directly.

const TOKEN_KEY = "perch.token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach Perch. Check your connection and retry.");
  }
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || "Something went wrong. Try again.");
    err.status = res.status;
    if (data) err.payload = data;
    throw err;
  }
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export function register(payload) {
  return request("/auth/register", { method: "POST", body: payload });
}
export function login(payload) {
  return request("/auth/login", { method: "POST", body: payload });
}
export function getMe() {
  return request("/auth/me", { auth: true });
}
export function updateMe(payload) {
  return request("/auth/me", { method: "PUT", body: payload, auth: true });
}

// ── Campuses ──────────────────────────────────────────────────────────────
export function listCampuses() {
  return request("/campuses");
}

// ── Venues ──────────────────────────────────────────────────────────────────
export function listVenues(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, v);
  });
  return request(`/venues?${q.toString()}`);
}
export function getVenue(id) {
  return request(`/venues/${id}`);
}
export function getVenueCheckins(id) {
  return request(`/venues/${id}/checkins`);
}
export function checkInVenue(id, payload) {
  return request(`/venues/${id}/checkin`, { method: "POST", body: payload, auth: true });
}

// ── Favorites ─────────────────────────────────────────────────────────────
export function listFavorites() {
  return request("/favorites", { auth: true });
}
export function addFavorite(payload) {
  return request("/favorites", { method: "POST", body: payload, auth: true });
}
export function updateFavorite(id, payload) {
  return request(`/favorites/${id}`, { method: "PUT", body: payload, auth: true });
}
export function removeFavorite(id) {
  return request(`/favorites/${id}`, { method: "DELETE", auth: true });
}

// ── Session prefs ─────────────────────────────────────────────────────────
export function listPrefs() {
  return request("/prefs", { auth: true });
}
export function createPref(payload) {
  return request("/prefs", { method: "POST", body: payload, auth: true });
}
export function deletePref(id) {
  return request(`/prefs/${id}`, { method: "DELETE", auth: true });
}

// ── Billing ───────────────────────────────────────────────────────────────
export function billingStatus() {
  return request("/billing/status");
}
export function startCheckout() {
  return request("/billing/checkout", { method: "POST", body: {}, auth: true });
}

// ── Realtime ───────────────────────────────────────────────────────────────
export function openCheckinStream(onCheckin) {
  const es = new EventSource("/api/stream");
  es.addEventListener("checkin", (e) => {
    try {
      onCheckin(JSON.parse(e.data));
    } catch {
      /* ignore */
    }
  });
  return es;
}