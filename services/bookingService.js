const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://backend-7cxc.onrender.com/api';

const buildHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchSeatAvailability = async ({ scheduleId, from, to }) => {
  const query = new URLSearchParams({
    schedule_id: String(scheduleId || ''),
    from: String(from || ''),
    to: String(to || ''),
  });

  const response = await fetch(`${API_BASE_URL}/available-seats?${query.toString()}`);
  const payload = await response.json().catch(() => ({}));

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
};

export const bookSeat = async ({ scheduleId, from, to, seatNumber, passengerName, token }) => {
  const response = await fetch(`${API_BASE_URL}/book-ticket`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      schedule_id: String(scheduleId || ''),
      from_stop: String(from || ''),
      to_stop: String(to || ''),
      seat_number: String(seatNumber || ''),
      passenger_name: passengerName || undefined,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success !== true) {
    throw new Error(payload?.message || payload?.error || `Failed to book seat ${seatNumber}`);
  }

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
