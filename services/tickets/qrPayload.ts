type TicketQrSource = {
  id?: string | number | null;
  ticketId?: string | number | null;
  ticket_id?: string | number | null;
  scheduleId?: string | number | null;
  schedule_id?: string | number | null;
  bookingRef?: string | null;
  booking_ref?: string | null;
  ticketNumber?: string | null;
  seatNumber?: string | number | null;
  seat_number?: string | number | null;
};

/** Build the payload consumed by the existing driver scanner. */
export function buildTicketQrValue(ticket: TicketQrSource | null | undefined): string | null {
  const ticketId = ticket?.ticketId ?? ticket?.ticket_id ?? ticket?.id;
  const tripId = ticket?.scheduleId ?? ticket?.schedule_id;
  if (ticketId === null || ticketId === undefined || !String(ticketId).trim()) return null;
  if (tripId === null || tripId === undefined || !String(tripId).trim()) return null;

  return JSON.stringify({
    ticketId: String(ticketId),
    ticket_id: String(ticketId),
    tripId: String(tripId),
    trip_id: String(tripId),
    scheduleId: String(tripId),
    schedule_id: String(tripId),
    bookingRef: ticket?.bookingRef ?? ticket?.booking_ref ?? null,
    booking_ref: ticket?.booking_ref ?? ticket?.bookingRef ?? null,
    ticketNumber: ticket?.ticketNumber ?? ticket?.bookingRef ?? ticket?.booking_ref ?? String(ticketId),
    seatNumber: ticket?.seatNumber ?? ticket?.seat_number ?? null,
  });
}
