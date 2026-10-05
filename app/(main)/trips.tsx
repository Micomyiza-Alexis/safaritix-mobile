import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyTickets, CommuterTicket } from '@/services/tickets/ticketService';

export default function TripsScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<CommuterTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try { setTickets(await getMyTickets()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load your trips.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}>
    <Text style={styles.title}>My Trips</Text><Text style={styles.subtitle}>Bookings returned by SafariTix.</Text>
    {loading ? <ActivityIndicator color="#0077B6" style={styles.loader} /> : error ? <View style={styles.state}><Ionicons name="alert-circle-outline" size={34} color="#B42318" /><Text style={styles.error}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.link}>Try again</Text></Pressable></View> : tickets.length === 0 ? <View style={styles.state}><Ionicons name="ticket-outline" size={42} color="#0077B6" /><Text style={styles.subtitle}>No trips returned by the backend.</Text></View> : tickets.map((ticket) => <View key={String(ticket.id)} style={styles.card}>
      <Text style={styles.route}>{ticket.from_stop || 'N/A'} → {ticket.to_stop || 'N/A'}</Text><Text style={styles.meta}>Status: {String(ticket.status || 'UNKNOWN').replace(/_/g, ' ')}</Text><Text style={styles.meta}>Booking: {ticket.booking_ref || 'N/A'}</Text><Text style={styles.meta}>Date: {ticket.schedule_date || 'N/A'} {ticket.departure_time || ''}</Text><Text style={styles.meta}>Seat: {ticket.seat_number || 'N/A'} · Bus: {ticket.bus_plate || 'N/A'}</Text><Text style={styles.meta}>Fare: {ticket.price == null ? 'N/A' : `RWF ${Number(ticket.price).toLocaleString()}`}</Text>
      <Pressable style={styles.open} onPress={() => router.push({ pathname: '/tickets/[id]', params: { id: String(ticket.id) } })}><Text style={styles.openText}>Open ticket</Text></Pressable><Pressable style={styles.track} onPress={() => router.push({ pathname: '/track-bus', params: { bookingId: String(ticket.booking_ref || ticket.id), scheduleId: String(ticket.schedule_id || ''), from: ticket.from_stop || '', to: ticket.to_stop || '', seatNumber: String(ticket.seat_number || ''), busPlate: ticket.bus_plate || '' } })}><Text style={styles.trackText}>Track this trip</Text></Pressable>
    </View>)}
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F8FAFC' }, content: { padding: 24, paddingTop: 34, gap: 12 }, title: { marginTop: 16, fontSize: 24, fontWeight: '700', color: '#0F172A' }, subtitle: { marginTop: 8, fontSize: 15, textAlign: 'center', color: '#64748B' }, loader: { marginTop: 30 }, state: { alignItems: 'center', gap: 10, paddingVertical: 70 }, error: { color: '#B42318', textAlign: 'center' }, link: { color: '#0077B6', fontWeight: '800' }, card: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 15, gap: 6 }, route: { fontWeight: '900', color: '#0F172A' }, meta: { color: '#64748B', fontSize: 13 }, open: { marginTop: 5, backgroundColor: '#0077B6', borderRadius: 10, padding: 11, alignItems: 'center' }, openText: { color: '#FFF', fontWeight: '800' }, track: { marginTop: 5, backgroundColor: '#E0F2FE', borderRadius: 10, padding: 11, alignItems: 'center' }, trackText: { color: '#0077B6', fontWeight: '800' } });
