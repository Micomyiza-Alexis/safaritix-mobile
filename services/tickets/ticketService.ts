import { api } from '@/services/api/client';
import { getAccessToken } from '@/services/auth/authService';

export interface CommuterTicket {
  id: string | number;
  ticket_id?: string | number;
  schedule_id?: string | number | null;
  seat_number?: string | number | null;
  booking_ref?: string | null;
  bookingRef?: string | null;
  ticketNumber?: string | null;
  price?: number | null;
  payment_id?: string | null;
  status?: string | null;
  from_stop?: string | null;
  to_stop?: string | null;
  schedule_date?: string | null;
  departure_time?: string | null;
  bus_plate?: string | null;
  busPlate?: string | null;
  fromStop?: string | null;
  toStop?: string | null;
  departureDate?: string | null;
  departureTime?: string | null;
  qr_code_url?: string | null;
  qrCodeUrl?: string | null;
  created_at?: string | null;
}

export async function getMyTickets(): Promise<CommuterTicket[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in to view your trips.');
  const response = await api.get<{ success: boolean; tickets?: CommuterTicket[] }>('/my-tickets', { token });
  return Array.isArray(response.tickets) ? response.tickets : [];
}
