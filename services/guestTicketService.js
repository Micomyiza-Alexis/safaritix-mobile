import { API_BASE_URL } from '../config/api';

const buildQuery = (params) => {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    const normalized = String(value || '').trim();
    if (normalized) query.set(key, normalized);
  });
  return query.toString();
};

const parseJson = async (response) => {
  const payload = await response.json().catch(() => ({}));
  return payload || {};
};

export const fetchGuestTickets = async ({ email, bookingId, bookingRef }) => {
  const query = buildQuery({ email, bookingId, bookingRef });
  const response = await fetch(`${API_BASE_URL}/mobile/my-tickets?${query}`);
  const payload = await parseJson(response);

  if (!response.ok || payload?.success !== true) {
    throw new Error(payload?.message || payload?.error || 'Unable to fetch your tickets');
  }

  return payload;
};

export const fetchGuestTracking = async ({ email, bookingId, bookingRef }) => {
  const query = buildQuery({ email, bookingRef });
  const response = await fetch(`${API_BASE_URL}/mobile/booking/${encodeURIComponent(String(bookingId || '').trim())}/location?${query}`);
  const payload = await parseJson(response);

  if (!response.ok || payload?.success !== true) {
    throw new Error(payload?.message || payload?.error || 'Unable to load live tracking');
  }

  return payload;
};
