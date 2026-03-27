import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { fetchGuestTickets } from '../services/guestTicketService';

const COLORS = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  secondary: '#F4A261',
  success: '#27AE60',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  danger: '#B42318',
};

const buildQrValue = (ticket, booking) => {
  const payload = ticket?.qrData;
  if (payload && typeof payload === 'object') return JSON.stringify(payload);

  return JSON.stringify({
    bookingId: ticket?.bookingId || booking?.bookingId || null,
    bookingRef: ticket?.bookingRef || booking?.bookingRef || null,
    ticketId: ticket?.ticketId || ticket?.id || null,
    ticketNumber: ticket?.ticketNumber || ticket?.booking_ref || ticket?.bookingRef || ticket?.id || null,
    seatNumber: ticket?.seatNumber || ticket?.seat_number || null,
    seatNumbers: ticket?.seatNumber ? [String(ticket.seatNumber)] : ticket?.seat_number ? [String(ticket.seat_number)] : [],
    from: ticket?.routeFrom || null,
    to: ticket?.routeTo || null,
    date: ticket?.departureDate || null,
    bus: ticket?.busPlate || null,
    userId: booking?.userId || null,
  });
};

export default function MyTicketsScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [tickets, setTickets] = useState([]);

  const ticketCount = tickets.length;

  const handleFetchTickets = async () => {
    if (!email.trim() || !bookingId.trim()) {
      setError('Enter your email and booking ID to view tickets.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = await fetchGuestTickets({
        email: email.trim(),
        bookingId: bookingId.trim(),
      });

      setBooking(payload?.booking || null);
      setTickets(Array.isArray(payload?.tickets) ? payload.tickets : []);

      if (!Array.isArray(payload?.tickets) || payload.tickets.length === 0) {
        setError('No tickets were found for that booking.');
      }
    } catch (err) {
      const message = err?.message || 'Failed to load tickets.';
      setError(message);
      setBooking(null);
      setTickets([]);
      Alert.alert('My Tickets', message);
    } finally {
      setLoading(false);
    }
  };

  const goToTracking = (ticket) => {
    const resolvedBookingId = booking?.bookingId || bookingId.trim();
    router.push({
      pathname: '/track-bus',
      params: {
        email: email.trim(),
        bookingId: String(resolvedBookingId || ''),
        bookingRef: booking?.bookingRef || '',
        ticketId: ticket?.ticketId || ticket?.id || '',
        scheduleId: ticket?.scheduleId || '',
        busId: ticket?.busId || '',
        busPlate: ticket?.busPlate || '',
        from: ticket?.routeFrom || '',
        to: ticket?.routeTo || '',
        seatNumber: ticket?.seatNumber || ticket?.seat_number || '',
      },
    });
  };

  const hasResults = ticketCount > 0;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>SafariTix</Text>
          <Text style={styles.title}>My Tickets</Text>
          <Text style={styles.subtitle}>Enter your booking details to view guest tickets and track your bus.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Find Your Tickets</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <TextInput
            value={bookingId}
            onChangeText={setBookingId}
            autoCapitalize="none"
            placeholder="Booking ID"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Pressable
            onPress={handleFetchTickets}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              loading && styles.primaryButtonDisabled,
              pressed && !loading && styles.primaryButtonPressed,
            ]}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Searching...</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>View Tickets</Text>
            )}
          </Pressable>

          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {hasResults ? (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>{ticketCount} ticket{ticketCount > 1 ? 's' : ''} found</Text>
              <Text style={styles.summaryText}>{booking?.bookingRef || booking?.bookingId || bookingId}</Text>
            </View>

            {tickets.map((ticket, index) => (
              <View key={ticket?.id || ticket?.ticketId || `${index}`} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <View>
                    <Text style={styles.ticketLabel}>Ticket {index + 1}</Text>
                    <Text style={styles.ticketNumber}>{ticket?.ticketNumber || ticket?.booking_ref || ticket?.ticketId || 'N/A'}</Text>
                  </View>
                  <View style={styles.seatPill}>
                    <Text style={styles.seatPillText}>Seat {ticket?.seatNumber || ticket?.seat_number || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.metaGrid}>
                  <Text style={styles.metaText}>Route: {ticket?.routeFrom || 'N/A'} {'->'} {ticket?.routeTo || 'N/A'}</Text>
                  <Text style={styles.metaText}>Departure: {ticket?.departureDate || 'TBA'} {ticket?.departureTime || ''}</Text>
                  <Text style={styles.metaText}>Bus: {ticket?.busPlate || 'N/A'}</Text>
                </View>

                <View style={styles.qrWrap}>
                  <QRCode
                    value={buildQrValue(ticket, booking)}
                    size={206}
                    backgroundColor="#FFFFFF"
                    color="#0F172A"
                    ecl="M"
                    quietZone={10}
                  />
                </View>

                <Pressable
                  onPress={() => goToTracking(ticket)}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
                >
                  <Ionicons name="navigate" size={16} color={COLORS.primary} />
                  <Text style={styles.secondaryButtonText}>Track Bus</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingTop: 56,
    paddingBottom: 28,
  },
  hero: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  kicker: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '700',
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
  },
  ticketLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ticketNumber: {
    marginTop: 2,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '900',
  },
  seatPill: {
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  seatPillText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '800',
  },
  metaGrid: {
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonPressed: {
    opacity: 0.85,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
