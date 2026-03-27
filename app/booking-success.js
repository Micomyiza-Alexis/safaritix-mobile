import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

const COLORS = {
  primary: '#0077B6',
  success: '#27AE60',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  card: '#FFFFFF',
};

const parseJsonParam = (value, fallback) => {
  try {
    return value ? JSON.parse(String(value)) : fallback;
  } catch {
    return fallback;
  }
};

const buildQrValue = (ticket, booking) => {
  const payload = ticket?.qrData || ticket?.qr_data || ticket?.qrCodeData || null;
  if (payload && typeof payload === 'object') {
    return JSON.stringify(payload);
  }

  return JSON.stringify({
    bookingId: booking?.bookingId || booking?.id || ticket?.payment_id || ticket?.booking_id || null,
    bookingRef: booking?.booking_ref || ticket?.booking_ref || ticket?.bookingRef || null,
    ticketId: ticket?.ticketId || ticket?.id || null,
    ticketNumber: ticket?.ticketNumber || ticket?.booking_ref || ticket?.bookingRef || ticket?.id || null,
    seatNumber: ticket?.seat_number || ticket?.seatNumber || null,
    seatNumbers: Array.isArray(booking?.seats) ? booking.seats.map(String) : [ticket?.seat_number || ticket?.seatNumber].filter(Boolean).map(String),
    from: booking?.from || null,
    to: booking?.to || null,
    date: booking?.departure_date || null,
    bus: booking?.bus_plate || null,
    userId: booking?.userId || ticket?.passenger_id || null,
  });
};

export default function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const booking = useMemo(() => parseJsonParam(params?.booking, {}), [params?.booking]);
  const tickets = useMemo(() => parseJsonParam(params?.tickets, []), [params?.tickets]);

  const seats = Array.isArray(booking?.seats) ? booking.seats : tickets.map((ticket) => ticket?.seat_number).filter(Boolean);
  const bookingRef = booking?.booking_ref || tickets?.[0]?.booking_ref || '';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Booking Confirmed</Text>
          <Text style={styles.heroSubtitle}>Your ticket has been created and sent to {booking?.email || 'your email'}.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Confirmation Details</Text>
          <Text style={styles.routeText}>{booking?.from || 'N/A'} {'->'} {booking?.to || 'N/A'}</Text>
          <Text style={styles.metaText}>Reference: {bookingRef || 'N/A'}</Text>
          <Text style={styles.metaText}>Seats: {seats.length ? seats.join(', ') : 'N/A'}</Text>
          <Text style={styles.metaText}>Departure: {booking?.departure_date || 'TBA'} {booking?.departure_time || ''}</Text>
          <Text style={styles.metaText}>Bus: {booking?.bus_plate || 'N/A'}</Text>
          <Text style={styles.metaText}>Email: {booking?.email || 'N/A'}</Text>
          <Text style={styles.metaText}>Phone: {booking?.phone || 'N/A'}</Text>
        </View>

        {tickets.length > 0 ? tickets.map((ticket, index) => (
          <View key={ticket?.id || ticket?.ticketId || `${index}`} style={styles.card}>
            <Text style={styles.sectionTitle}>Ticket {index + 1}</Text>
            <Text style={styles.metaText}>Ticket Number: {ticket?.ticketNumber || ticket?.booking_ref || ticket?.bookingRef || ticket?.id || 'N/A'}</Text>
            <Text style={styles.metaText}>Seat: {ticket?.seat_number || ticket?.seatNumber || 'N/A'}</Text>
            <View style={styles.qrBox}>
              <QRCode
                value={buildQrValue(ticket, booking)}
                size={220}
                backgroundColor="#FFFFFF"
                color="#0F172A"
                ecl="M"
                quietZone={10}
              />
            </View>
            <Text style={styles.qrCaption}>Scan this code at boarding.</Text>
          </View>
        )) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ticket QR</Text>
            <View style={styles.qrBox}>
              <QRCode
                value={buildQrValue({}, booking)}
                size={220}
                backgroundColor="#FFFFFF"
                color="#0F172A"
                ecl="M"
                quietZone={10}
              />
            </View>
            <Text style={styles.qrCaption}>Scan this code at boarding.</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Next Step</Text>
          <Text style={styles.metaText}>
            Check your inbox for the e-ticket with the QR code. You can use that QR code for boarding verification.
          </Text>
        </View>

        <Pressable onPress={() => router.replace('/LandingPage')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </Pressable>
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
    paddingTop: 64,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  heroSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.muted,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 8,
  },
  qrBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  qrCaption: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
