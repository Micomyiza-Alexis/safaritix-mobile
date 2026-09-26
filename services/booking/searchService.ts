import { api } from '@/services/api/client';

export interface TripSearchParams {
  from: string;
  to: string;
  date: string;
}

export interface Trip {
  schedule_id: number | string;
  bus_id?: number | string | null;
  bus_plate?: string | null;
  route_id?: number | string | null;

  from_location?: string | null;
  to_location?: string | null;

  pickup_stop?: string | null;
  dropoff_stop?: string | null;

  departure_date?: string | null;
  departure_time?: string | null;

  price?: number | string | null;
  available_seats?: number | null;

  company_name?: string | null;

  status?: string | null;
}

interface SearchTripsResponse {
  trips?: Trip[];
  data?: Trip[];
}

export async function searchTrips(
  params: TripSearchParams,
): Promise<Trip[]> {
  const query = new URLSearchParams({
    from: params.from.trim(),
    to: params.to.trim(),
    date: params.date,
  });

  const response = await api.get<SearchTripsResponse | Trip[]>(
    `/search-trips?${query.toString()}`,
  );

  if (Array.isArray(response)) {
    return response;
  }

  return response.trips ?? response.data ?? [];
}