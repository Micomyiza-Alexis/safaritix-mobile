import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchGuestTracking } from '../services/guestTicketService';
import TrackBusMap from '../components/TrackBusMap';

const COLORS = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  success: '#27AE60',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  card: '#FFFFFF',
  danger: '#B42318',
};

export default function TrackBusScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = String(params?.email || '');
  const bookingId = String(params?.bookingId || params?.booking_id || '');
  const bookingRef = String(params?.bookingRef || params?.booking_ref || '');
  const from = String(params?.from || '');
  const to = String(params?.to || '');
  const busPlate = String(params?.busPlate || '');
  const seatNumber = String(params?.seatNumber || '');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(null);

  const location = tracking?.location || null;
  const booking = tracking?.booking || {};
  const coordinates = useMemo(() => {
    if (!location?.latitude || !location?.longitude) return null;
    return {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };
  }, [location?.latitude, location?.longitude]);

  const region = useMemo(() => {
    if (!coordinates) {
      return {
        latitude: -1.9441,
        longitude: 30.0619,
        latitudeDelta: 0.22,
        longitudeDelta: 0.22,
      };
    }

    return {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }, [coordinates]);

  const loadTracking = useCallback(async (silent = false) => {
    const bookingKey = bookingId || bookingRef;

    if (!email || !bookingKey) {
      setLoading(false);
      setError('Missing booking details. Please go back to My Tickets.');
      return;
    }

    if (silent) setRefreshing(true);
    else setLoading(true);

    setError('');

    try {
      const payload = await fetchGuestTracking({ email, bookingId: bookingKey, bookingRef });
      setTracking(payload);
    } catch (err) {
      setError(err?.message || 'Unable to load live bus tracking.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [email, bookingId, bookingRef]);

  useEffect(() => {
    loadTracking(false);
    const timer = setInterval(() => {
      loadTracking(true).catch(() => undefined);
    }, 5000);

    return () => clearInterval(timer);
  }, [loadTracking]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={18} color={COLORS.text} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Track Bus</Text>
          <Text style={styles.headerSubtitle}>{busPlate || booking?.busPlate || 'SafariTix bus'}</Text>
        </View>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <Text style={styles.metaText}>{from || booking?.from || 'N/A'} {'->'} {to || booking?.to || 'N/A'}</Text>
          <Text style={styles.metaText}>Booking ID: {bookingId}</Text>
          <Text style={styles.metaText}>Seat: {seatNumber || booking?.seatNumber || 'N/A'}</Text>
          <Text style={styles.metaText}>Source: {location?.source === 'live_gps' ? 'Live GPS' : 'Demo tracking'}</Text>
        </View>

        <View style={styles.mapCard}>
          <TrackBusMap
            loading={loading}
            coordinates={coordinates}
            region={region}
            busPlate={busPlate || booking?.busPlate || 'SafariTix bus'}
            locationLabel={location?.currentLocationLabel || 'Current bus location'}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Live Status</Text>
          <Text style={styles.metaText}>Current location: {location?.currentLocationLabel || 'Tracking not available yet'}</Text>
          <Text style={styles.metaText}>ETA: {typeof tracking?.calculations?.etaMinutes === 'number' ? `${Math.max(1, Math.round(tracking.calculations.etaMinutes))} min` : 'TBA'}</Text>
          <Text style={styles.metaText}>Distance remaining: {typeof tracking?.calculations?.distanceRemainingKm === 'number' ? `${tracking.calculations.distanceRemainingKm.toFixed(1)} km` : 'TBA'}</Text>
          <Text style={styles.metaText}>Last updated: {location?.timestamp ? new Date(location.timestamp).toLocaleTimeString() : 'N/A'}</Text>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          onPress={() => loadTracking(true)}
          style={({ pressed }) => [styles.refreshButton, pressed && styles.refreshButtonPressed]}
        >
          {refreshing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh Tracking</Text>
          )}
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
  header: {
    paddingTop: 54,
    paddingBottom: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  iconButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  content: {
    padding: 14,
    gap: 12,
    paddingBottom: 26,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  mapCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    height: 360,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  refreshButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonPressed: {
    opacity: 0.88,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
