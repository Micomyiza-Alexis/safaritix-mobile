import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { getMyTickets, CommuterTicket } from '@/services/tickets/ticketService';

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<CommuterTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const tickets = await getMyTickets();
      const found = tickets.find((item) => String(item.id) === String(id) || String(item.ticket_id) === String(id));
      if (!found) throw new Error('Ticket was not found in your authenticated tickets.');
      setTicket(found);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load this ticket.'); }
    finally { setLoading(false); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (loading) return <View style={styles.center}><ActivityIndicator color="#0077B6" /></View>;
  if (error || !ticket) return <View style={styles.center}><Text style={styles.error}>{error || 'Ticket unavailable.'}</Text><Pressable onPress={load}><Text style={styles.link}>Try again</Text></Pressable></View>;
  const qrCodeUrl = ticket.qrCodeUrl || ticket.qr_code_url;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back to Trips</Text></Pressable><Text style={styles.title}>Ticket Details</Text>
    <View style={styles.card}><Text style={styles.route}>{ticket.from_stop || ticket.fromStop || 'N/A'} → {ticket.to_stop || ticket.toStop || 'N/A'}</Text><Text style={styles.detail}>Ticket number: {ticket.ticketNumber || ticket.booking_ref || ticket.id}</Text><Text style={styles.detail}>Booking reference: {ticket.booking_ref || ticket.bookingRef || 'N/A'}</Text><Text style={styles.detail}>Travel date: {ticket.schedule_date || ticket.departureDate || 'N/A'}</Text><Text style={styles.detail}>Departure: {ticket.departure_time || ticket.departureTime || 'N/A'}</Text><Text style={styles.detail}>Bus: {ticket.bus_plate || ticket.busPlate || 'N/A'}</Text><Text style={styles.detail}>Seat: {ticket.seat_number || 'N/A'}</Text><Text style={styles.detail}>Status: {String(ticket.status || 'UNKNOWN').replace(/_/g, ' ')}</Text></View>
    <View style={styles.card}><Text style={styles.heading}>Boarding QR code</Text>{qrCodeUrl ? <Image accessibilityLabel="Ticket QR code" source={{ uri: qrCodeUrl }} style={styles.qr} resizeMode="contain" /> : <Text style={styles.detail}>The backend did not return a QR code for this ticket.</Text>}{qrCodeUrl ? <Text style={styles.caption}>Show this backend-generated QR code when boarding.</Text> : null}</View>
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#F8FAFC' }, content: { padding: 20, paddingTop: 60, gap: 14 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }, back: { color: '#0077B6', fontWeight: '800', fontSize: 15 }, title: { fontSize: 26, fontWeight: '900', color: '#0F172A' }, card: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 9 }, route: { color: '#0077B6', fontSize: 18, fontWeight: '900' }, heading: { color: '#0F172A', fontSize: 18, fontWeight: '900' }, detail: { color: '#475569', fontSize: 14, fontWeight: '600' }, caption: { color: '#64748B', textAlign: 'center', fontSize: 12 }, qr: { width: 240, height: 240, alignSelf: 'center' }, error: { color: '#B42318', textAlign: 'center' }, link: { color: '#0077B6', fontWeight: '800' } });
