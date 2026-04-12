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
  try {
    if (!API_BASE_URL) {
      throw new Error('API base URL is not configured. Please check your environment variables.');
    }

    const query = buildQuery({ email, bookingId, bookingRef });
    const url = `${API_BASE_URL}/mobile/my-tickets?${query}`;

    console.log('[fetchGuestTickets] Calling:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const payload = await parseJson(response);

    console.log('[fetchGuestTickets] Response status:', response.status, 'Payload:', payload);

    if (!response.ok || payload?.success !== true) {
      throw new Error(payload?.message || payload?.error || `Server error (${response.status}): Unable to fetch your tickets`);
    }

    return payload;
  } catch (error) {
    const errorMsg = error?.message || 'Network error - please check your connection';
    console.error('[fetchGuestTickets] Error:', errorMsg, error);
    throw new Error(errorMsg);
  }
};

export const fetchGuestTracking = async ({ email, bookingId, bookingRef }) => {
  try {
    if (!API_BASE_URL) {
      throw new Error('API base URL is not configured. Please check your environment variables.');
    }

    const query = buildQuery({ email, bookingRef });
    const url = `${API_BASE_URL}/mobile/booking/${encodeURIComponent(String(bookingId || '').trim())}/location?${query}`;

    console.log('[fetchGuestTracking] Calling:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const payload = await parseJson(response);

    console.log('[fetchGuestTracking] Response status:', response.status, 'Payload:', payload);

    if (!response.ok || payload?.success !== true) {
      throw new Error(payload?.message || payload?.error || `Server error (${response.status}): Unable to load live tracking`);
    }

    return payload;
  } catch (error) {
    const errorMsg = error?.message || 'Network error - please check your connection';
    console.error('[fetchGuestTracking] Error:', errorMsg, error);
    throw new Error(errorMsg);
  }
};
