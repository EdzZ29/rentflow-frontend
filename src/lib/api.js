// Tiny RentFlow API client for the web app.
//
// Auth uses an httpOnly cookie set by the API — the token is never stored in
// JavaScript-accessible storage, so XSS can't steal it. Every request sends
// credentials so the browser attaches the cookie automatically.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// Origin without the /api suffix, for building URLs to uploaded images.
const ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function assetUrl(path) {
  if (!path) return null;
  if (/^https?:/i.test(path)) return path;
  return `${ORIGIN}${path}`;
}

// URL for the live Server-Sent Events stream (auth via the httpOnly cookie).
export const realtimeUrl = () => `${API_URL}/realtime/stream`;

// Full URL that starts a provider OAuth flow (we redirect the browser here).
export const oauthUrl = (provider) => `${API_URL}/auth/${provider}`;

// Build a "?a=b&c=d" query string, dropping empty values.
function qs(params) {
  const s = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v),
  ).toString();
  return s ? `?${s}` : '';
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Request failed (${res.status})`;
    try {
      const json = JSON.parse(text);
      if (json.message) {
        message = Array.isArray(json.message)
          ? json.message.join(', ')
          : json.message;
      }
    } catch {
      /* keep default message */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  // ── Auth (cookie-based) ───────────────────────────────
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  // Self-service profile (name / email / password) for the signed-in user.
  updateProfile: (data) => request('/auth/me', { method: 'PATCH', body: data }),
  uploadAvatar: async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API_URL}/auth/me/avatar`, {
      method: 'POST',
      credentials: 'include',
      body: fd,
    });
    if (!res.ok) throw new Error('Avatar upload failed');
    return res.json();
  },
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) =>
    request('/auth/reset-password', { method: 'POST', body: { token, password } }),

  // ── Users (admin) ─────────────────────────────────────
  users: {
    list: () => request('/users'),
    create: (data) => request('/users', { method: 'POST', body: data }),
    update: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: data }),
    remove: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  },

  // ── Admin ─────────────────────────────────────────────
  admin: {
    stats: () => request('/admin/stats'),
  },

  // ── Businesses (owner / admin) ────────────────────────
  businesses: {
    list: () => request('/businesses'),
    get: (id) => request(`/businesses/${id}`),
    create: (data) => request('/businesses', { method: 'POST', body: data }),
    update: (id, data) => request(`/businesses/${id}`, { method: 'PATCH', body: data }),
    remove: (id) => request(`/businesses/${id}`, { method: 'DELETE' }),
    uploadImage: async (id, file) => {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_URL}/businesses/${id}/image`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      if (!res.ok) throw new Error('Image upload failed');
      return res.json();
    },
  },

  // ── Public rentals storefront ─────────────────────────
  rentals: {
    list: (params = {}) => request(`/rentals${qs(params)}`),
    get: (id) => request(`/rentals/${id}`),
    products: (params = {}) => request(`/rentals/products${qs(params)}`),
    product: (id) => request(`/rentals/products/${id}`),
    // Other products from the same business as the given product.
    related: (id) => request(`/rentals/products/${id}/related`),
    packages: (params = {}) => request(`/rentals/packages${qs(params)}`),
    package: (id) => request(`/rentals/packages/${id}`),
  },

  // ── Product reviews (public read, customer write) ─────
  reviews: {
    list: (productId) => request(`/rentals/products/${productId}/reviews`),
    create: (productId, data) =>
      request(`/rentals/products/${productId}/reviews`, { method: 'POST', body: data }),
    // The signed-in customer's own reviews (keyed by product).
    mine: () => request('/reviews/mine'),
  },

  // ── Owner reviews (analytics feed + reply management) ─
  ownerReviews: {
    list: () => request('/owner/reviews'),
    reply: (id, reply) =>
      request(`/owner/reviews/${id}/reply`, { method: 'POST', body: { reply } }),
    deleteReply: (id) => request(`/owner/reviews/${id}/reply`, { method: 'DELETE' }),
  },

  // ── Products (owner / admin) ──────────────────────────
  products: {
    listByBusiness: (businessId) => request(`/products?businessId=${businessId}`),
    create: (data) => request('/products', { method: 'POST', body: data }),
    update: (id, data) => request(`/products/${id}`, { method: 'PATCH', body: data }),
    remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    uploadImage: async (id, file) => {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_URL}/products/${id}/image`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      if (!res.ok) throw new Error('Image upload failed');
      return res.json();
    },
  },

  // ── Packages (owner-defined bundles of offerings) ────
  packages: {
    listByBusiness: (businessId) => request(`/packages?businessId=${businessId}`),
    create: (data) => request('/packages', { method: 'POST', body: data }),
    update: (id, data) => request(`/packages/${id}`, { method: 'PATCH', body: data }),
    remove: (id) => request(`/packages/${id}`, { method: 'DELETE' }),
  },

  // ── Bookings (a booking is either "book" or "reserve") ─
  bookings: {
    list: () => request('/reservations'),
    create: (data) => request('/reservations', { method: 'POST', body: data }),
    // Owner records a booking for a walk-in/offline customer.
    createForOwner: (data) =>
      request('/reservations/owner', { method: 'POST', body: data }),
    updateStatus: (id, status) =>
      request(`/reservations/${id}`, { method: 'PATCH', body: { status } }),
  },
  // Alias kept for the owner-side "manage" views.
  reservations: {
    list: () => request('/reservations'),
    updateStatus: (id, status) =>
      request(`/reservations/${id}`, { method: 'PATCH', body: { status } }),
  },

  // ── Support tickets (customer/owner ↔ admin chat) ────
  support: {
    list: () => request('/support/tickets'),
    get: (id) => request(`/support/tickets/${id}`),
    create: (data) => request('/support/tickets', { method: 'POST', body: data }),
    sendMessage: (id, body) =>
      request(`/support/tickets/${id}/messages`, { method: 'POST', body: { body } }),
    updateStatus: (id, status) =>
      request(`/support/tickets/${id}`, { method: 'PATCH', body: { status } }),
  },

  // ── Notifications ─────────────────────────────────────
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },

  // ── Owner activity log ────────────────────────────────
  activity: {
    list: (params = {}) => request(`/owner/activity${qs(params)}`),
  },

  // ── Owner subscription ────────────────────────────────
  subscription: {
    get: () => request('/owner/subscription'),
    startTrial: () => request('/owner/subscription/trial', { method: 'POST' }),
    choosePlan: (plan) => request('/owner/subscription', { method: 'POST', body: { plan } }),
  },
};
