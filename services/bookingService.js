import { API_BASE_URL } from '../config/api';

const buildHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchSeatAvailability = async ({ scheduleId, from, to }) => {
  try {
    if (!API_BASE_URL) {
      throw new Error('API base URL is not configured');
    }

    const query = new URLSearchParams({
      schedule_id: String(scheduleId || ''),
      from: String(from || ''),
      to: String(to || ''),
    });

    const url = `${API_BASE_URL}/available-seats?${query.toString()}`;
    console.log('[fetchSeatAvailability] Calling:', url);

    const response = await fetch(url, { timeout: 15000 });
    const payload = await response.json().catch(() => ({}));

    console.log('[fetchSeatAvailability] Response:', response.status, payload);

    if (!response.ok || payload?.success !== true) {
      throw new Error(payload?.message || payload?.error || 'Failed to fetch seat availability');
    }

    const totalSeats = Number(payload?.total_seats || 0);
    const availableSeats = Array.isArray(payload?.seat_numbers)
      ? payload.seat_numbers.map((seat) => Number(seat)).filter((seat) => Number.isInteger(seat) && seat > 0)
      : [];

    return {
      totalSeats,
      availableSeats,
      scheduleId: payload?.schedule_id || scheduleId,
      from,
      to,
    };
  } catch (error) {
    console.error('[fetchSeatAvailability] Error:', error?.message);
    throw error;
  }
};

export const bookSeat = async ({ scheduleId, from, to, seatNumber, passengerName, token }) => {
  try {
    if (!API_BASE_URL) {
      throw new Error('API base URL is not configured');
    }

    const url = `${API_BASE_URL}/book-ticket`;
    console.log('[bookSeat] Calling:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({
        schedule_id: String(scheduleId || ''),
        from_stop: String(from || ''),
        to_stop: String(to || ''),
        seat_number: String(seatNumber || ''),
        passenger_name: passengerName || undefined,
      }),
      timeout: 15000,
    });

    const payload = await response.json().catch(() => ({}));

    console.log('[bookSeat] Response:', response.status, payload);

    if (!response.ok || payload?.success !== true) {
      throw new Error(payload?.message || payload?.error || `Failed to book seat ${seatNumber}`);
    }

    return payload?.ticket || null;
  } catch (error) {
    console.error('[bookSeat] Error:', error?.message);
    throw error;
  }
};

export const bookMultipleSeats = async ({ scheduleId, from, to, seatNumbers, passengerName, token }) => {
  const booked = [];

  for (const seatNumber of seatNumbers) {
    // Sequence booking calls to avoid race conditions on the same schedule.
    const ticket = await bookSeat({
      scheduleId,
      from,
      to,
      seatNumber,
      passengerName,
      token,
    });
    booked.push({ seatNumber, ticket });
  }

  return booked;
};

export const confirmMobilePayment = async ({
  phone,
  email,
  from,
  to,
  seatNumbers,
  scheduleId,
  passengerName,
}) => {
  try {
    if (!API_BASE_URL) {
      throw new Error('API base URL is not configured');
    }

    const url = `${API_BASE_URL}/mobile/confirm-payment`;
    console.log('[confirmMobilePayment] Calling:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        schedule_id: String(scheduleId || ''),
        from_stop: String(from || ''),
        to_stop: String(to || ''),
        seat_numbers: Array.isArray(seatNumbers) ? seatNumbers.map((seat) => String(seat)) : [],
        passenger_name: passengerName || 'Mobile Passenger',
        email: String(email || '').trim(),
        phone: String(phone || '').trim(),
      }),
      timeout: 15000,
    });

    const payload = await response.json().catch(() => ({}));

    console.log('[confirmMobilePayment] Response:', response.status, payload);

    if (!response.ok || payload?.success !== true) {
      throw new Error(payload?.message || payload?.error || 'Failed to confirm payment and create booking');
    }

    return payload;
  } catch (error) {
    console.error('[confirmMobilePayment] Error:', error?.message);
    throw error;
  }
};
