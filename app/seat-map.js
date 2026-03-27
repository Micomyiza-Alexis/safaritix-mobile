import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SeatItem from '../components/seat-map/SeatItem';
import { fetchSeatAvailability } from '../services/bookingService';

const MAX_SEATS_PER_BOOKING = 4;

const COLORS = {
  primary: '#0077B6',
  secondary: '#F4A261',
  success: '#27AE60',
  danger: '#E74C3C',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  bg: '#FFFFFF',
  card: '#F8FAFC',
};

// Bus layout model (visual -> seat number):
// - Front-left is reserved for the driver (no seats).
// - Front-right has Seat 1 only (Seat 2 starts on the next visual row).
// - Visual rows 2+ have 2 seats on the left + aisle + 2 seats on the right.
// - Seat numbers increase sequentially from the front of the bus.
const buildSeatRows = (totalSeats) => {
  // The intended bus layout shown in the design goes up to seat 29.
  const normalizedTotal = Math.min(29, Math.max(0, Number(totalSeats || 0)));
  if (normalizedTotal === 0) return [];

  const rows = [];

  // Row 1: driver at front-left, seat 1 at front-right (right side only).
  rows.push({
    id: 'row-1',
    rowNumber: 1,
    leftA: null,
    leftB: null,
    rightA: 1 <= normalizedTotal ? 1 : null,
    rightB: null,
  });

  // Rows 2+: 2 seats left then 2 seats right.
  let seatCursor = 2; // next seat number after (seat 1)
  let rowNumber = 2;
  while (seatCursor <= normalizedTotal) {
    rows.push({
      id: `row-${rowNumber}`,
      rowNumber,
      leftA: seatCursor <= normalizedTotal ? seatCursor : null,
      leftB: seatCursor + 1 <= normalizedTotal ? seatCursor + 1 : null,
      rightA: seatCursor + 2 <= normalizedTotal ? seatCursor + 2 : null,
      rightB: seatCursor + 3 <= normalizedTotal ? seatCursor + 3 : null,
    });

    seatCursor += 4;
    rowNumber += 1;
  }

  return rows;
};

const createFallbackSeatSnapshot = () => {
  // Demo layout capped to 29 seats for the intended bus architecture.
  const totalSeats = 29;
  // Default to everything being available in fallback (matches the provided layout screenshot).
  const bookedSeats = [];
  const bookedSet = new Set(bookedSeats);

  const availableSeats = [];
  for (let seat = 1; seat <= totalSeats; seat += 1) {
    if (!bookedSet.has(seat)) availableSeats.push(seat);
  }

  return { totalSeats, availableSeats, bookedSeats };
};

export default function SeatMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const scheduleId = String(params?.scheduleId || '');
  const fromStop = String(params?.from || '');
  const toStop = String(params?.to || '');
  const busPlate = String(params?.busPlate || 'Bus');
  const departureTime = String(params?.departureTime || 'TBA');
  const departureDate = String(params?.departureDate || '');
  const price = Number(params?.price || 0);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalSeats, setTotalSeats] = useState(0);

  const seatSize = Math.max(36, Math.min(48, Math.floor((width - 96) / 4)));

  const seatState = useMemo(() => {
    const map = new Map();
    for (let seat = 1; seat <= totalSeats; seat += 1) {
      map.set(seat, 'booked');
    }

    availableSeats.forEach((seat) => map.set(seat, 'available'));
    selectedSeats.forEach((seat) => map.set(seat, 'selected'));
    bookedSeats.forEach((seat) => map.set(seat, 'booked'));
    return map;
  }, [totalSeats, availableSeats, bookedSeats, selectedSeats]);

  const seatRows = useMemo(() => buildSeatRows(totalSeats), [totalSeats]);

  const applySnapshot = useCallback((snapshot) => {
    const total = Number(snapshot?.totalSeats || 0);
    const available = Array.isArray(snapshot?.availableSeats)
      ? snapshot.availableSeats.map((seat) => Number(seat)).filter((seat) => Number.isInteger(seat) && seat > 0)
      : [];

    const availableSet = new Set(available);
    const computedBooked = [];
    for (let seat = 1; seat <= total; seat += 1) {
      if (!availableSet.has(seat)) computedBooked.push(seat);
    }

    setTotalSeats(total);
    setAvailableSeats(available);
    setBookedSeats(computedBooked);
    setSelectedSeats((prev) => prev.filter((seat) => availableSet.has(seat)));
  }, []);

  const refreshAvailability = useCallback(async () => {
    if (!scheduleId || !fromStop || !toStop) return;

    const snapshot = await fetchSeatAvailability({
      scheduleId,
      from: fromStop,
      to: toStop,
    });

    applySnapshot(snapshot);
  }, [scheduleId, fromStop, toStop, applySnapshot]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        await refreshAvailability();
      } catch (_err) {
        // Demo fallback so seat map remains usable during backend slowness.
        applySnapshot(createFallbackSeatSnapshot());
        if (mounted) {
          setError('Live seat sync is temporarily unavailable. Showing demo seat data.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // Poll live for current session updates.
    const id = setInterval(() => {
      refreshAvailability().catch(() => undefined);
    }, 8000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [refreshAvailability, applySnapshot]);

  const toggleSeat = (seatNumber) => {
    const state = seatState.get(seatNumber);
    if (state === 'booked') return;

    setSelectedSeats((prev) => {
      const exists = prev.includes(seatNumber);
      if (exists) {
        return prev.filter((seat) => seat !== seatNumber);
      }

      if (prev.length >= MAX_SEATS_PER_BOOKING) {
        Alert.alert('Seat limit', `You can select up to ${MAX_SEATS_PER_BOOKING} seats.`);
        return prev;
      }

      return [...prev, seatNumber];
    });
  };

  const onConfirmBooking = async () => {
    if (!selectedSeats.length || booking) return;

    router.push({
      pathname: '/payment',
      params: {
        scheduleId,
        from: fromStop,
        to: toStop,
        seats: JSON.stringify(selectedSeats),
        departureDate,
        departureTime,
        busPlate,
        price: String(price || 0),
      },
    });
  };

  const remainingSeats = availableSeats.length;

  const renderSeat = (seatNumber) => {
    if (!seatNumber) return <View style={{ width: seatSize, height: seatSize }} />;

    return (
      <SeatItem
        seatNumber={seatNumber}
        state={seatState.get(seatNumber)}
        onPress={toggleSeat}
        size={seatSize}
      />
    );
  };

  const renderDriverBadge = () => (
    <View style={styles.driverBadge}>
      <View style={styles.driverIconBox}>
        <Ionicons name="person" size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.driverText}>Driver</Text>
    </View>
  );

  const renderSeatRow = ({ item }) => (
    <View style={styles.seatRow}>
      {/* Front row: driver at the front-left */}
      {item.rowNumber === 1 ? (
        <View style={[styles.driverLeftCell, { width: seatSize * 2 + 8 }]}>{renderDriverBadge()}</View>
      ) : (
        <View style={styles.sideCluster}>
          {renderSeat(item.leftA)}
          {renderSeat(item.leftB)}
        </View>
      )}

      {/* Visual aisle divider */}
      <View style={styles.aisleDivider} />

      {/* Seats on the front-right / right side */}
      <View style={styles.sideCluster}>
        {renderSeat(item.rightA)}
        {renderSeat(item.rightB)}
      </View>
    </View>
  );

  if (!scheduleId || !fromStop || !toStop) {
    return (
      <View style={styles.centeredBox}>
        <Text style={styles.errorText}>Missing schedule info. Please go back and search again.</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header remains at the top */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={18} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Seat Map</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      {/* Confirm bar stays outside the ScrollView so it is always visible */}
      <View style={styles.topActionBar}>
        <View style={styles.stickyInfo}>
          <Text style={styles.stickyInfoText}>
            {selectedSeats.length > 0
              ? `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected`
              : 'Select seat(s) to continue'}
          </Text>
          <Text style={styles.stickyInfoSubText}>
            Total: RWF {(selectedSeats.length * price).toLocaleString()}
          </Text>
        </View>
        <Pressable
          onPress={onConfirmBooking}
          disabled={selectedSeats.length === 0 || booking}
          style={({ pressed }) => [
            styles.confirmButton,
            (selectedSeats.length === 0 || booking) && styles.confirmButtonDisabled,
            pressed && selectedSeats.length > 0 && !booking && styles.confirmButtonPressed,
          ]}
        >
          <Text style={styles.confirmButtonText}>
            {booking
              ? 'Loading...'
              : selectedSeats.length > 0
                ? `Confirm Booking (${selectedSeats.length})`
                : 'Confirm Booking'}
          </Text>
        </Pressable>
      </View>

      {/* Seat map area remains scrollable for buses with many rows */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tripCard}>
          <Text style={styles.tripRoute}>{fromStop}{' -> '}{toStop}</Text>
          <Text style={styles.tripMeta}>Bus: {busPlate} • {departureDate || 'Date TBA'} {departureTime}</Text>
          <Text style={styles.tripMeta}>Price per seat: RWF {price.toLocaleString()}</Text>
          <Text style={styles.tripMeta}>Remaining seats: {remainingSeats}</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.success }]} /><Text style={styles.legendText}>Available</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} /><Text style={styles.legendText}>Selected</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} /><Text style={styles.legendText}>Booked</Text></View>
        </View>

        <View style={styles.busContainer}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading seats...</Text>
            </View>
          ) : (
            <FlatList
              data={seatRows}
              renderItem={renderSeatRow}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.seatList}
            />
          )}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 54,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  content: {
    padding: 14,
    gap: 12,
    paddingBottom: 128,
  },

  tripCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    padding: 12,
    gap: 4,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  tripMeta: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '700',
  },

  busContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 10,
  },
  frontIndicator: {
    // Front-left orientation to match the driver placement.
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  frontIndicatorText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
  },

  seatList: {
    gap: 8,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  sideCluster: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },

  // Vertical aisle divider between left and right seat blocks.
  aisleDivider: {
    width: 12,
    backgroundColor: '#E5E7EB',
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },

  // Front-left driver area (replaces the left seat slots on the first visual row).
  driverLeftCell: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  driverBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 0,
  },
  driverIconBox: {
    width: 34,
    height: 30,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },

  // Action bar is fixed by layout order (outside ScrollView), not absolute positioning.
  topActionBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
    gap: 8,
  },
  stickyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickyInfoText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '800',
  },
  stickyInfoSubText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  confirmButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.45,
  },
  confirmButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  errorText: {
    fontSize: 12,
    color: '#B42318',
    fontWeight: '600',
  },
  centeredBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  backButton: {
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
