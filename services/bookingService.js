import { api } from './api/client';
import { getAccessToken } from './auth/authService';
import { API_BASE_URL } from '../config/api';

export const fetchSeatAvailability = async ({ scheduleId, from, to }) => {
  const token = await getAccessToken();
  const query = new URLSearchParams({ schedule_id: String(scheduleId || ''), from: String(from || ''), to: String(to || '') });
  const endpoint = `/available-seats?${query.toString()}`;
  console.log('[seatAvailability] GET', `${API_BASE_URL}${endpoint}`, {
    scheduleId: String(scheduleId || ''),
    from: String(from || ''),
    to: String(to || ''),
  });

  try {
    const payload = await api.get(endpoint, { token });
    console.log('[seatAvailability] response', {
      scheduleId: payload?.schedule_id,
      totalSeats: payload?.total_seats,
      availableSeats: payload?.seat_numbers,
    });
    return {
      totalSeats: Number(payload?.total_seats || 0),
      availableSeats: Array.isArray(payload?.seat_numbers)
        ? payload.seat_numbers.map((seat) => Number(seat)).filter((seat) => Number.isInteger(seat) && seat > 0)
        : [],
      scheduleId: payload?.schedule_id || scheduleId,
      from,
      to,
    };
  } catch (error) {
    console.error('[seatAvailability] error', {
      status: error?.status || 0,
      body: error?.data || null,
      message: error?.message || 'Unknown request error',
    });
    throw error;
  }
};

export const bookSeat = async ({ scheduleId, from, to, seatNumber, passengerName, token }) => {
  const payload = await api.post('/book-ticket', {
    schedule_id: String(scheduleId || ''), from_stop: String(from || ''), to_stop: String(to || ''),
    seat_number: String(seatNumber || ''), passenger_name: passengerName || undefined,
  }, { token: token || await getAccessToken() });
  return payload?.ticket || null;
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

export const bookMobileTicket = async ({
  from,
  to,
  seatNumbers,
  scheduleId,
  idempotencyKey,
}) => {
  const token = await getAccessToken();
  return api.post('/mobile/book-ticket', {
    schedule_id: String(scheduleId || ''), from_stop: String(from || ''), to_stop: String(to || ''),
    seat_numbers: Array.isArray(seatNumbers) ? seatNumbers.map((seat) => String(seat)) : [],
    idempotency_key: idempotencyKey,
  }, { token, headers: { 'Idempotency-Key': idempotencyKey } });
};
