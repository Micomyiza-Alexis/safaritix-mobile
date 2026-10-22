import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchSeatAvailability } from '../services/bookingService';

const MAX_SEATS_PER_BOOKING = 4;
// Rwanda coach: 30 seats minus the driver = 29 commuter seats (1 front + 7 rows of 4).
// The UI never renders or sells a seat above this number, whatever totalSeats says.
const MAX_COMMUTER_SEATS = 29;

const C = {
  brand: '#0077B6',
  brandDeep: '#005F8E',
  brandSoft: '#E6F4FB',
  ink: '#0B2236',
  text: '#0F172A',
  sub: '#475569',
  muted: '#64748B',
  line: '#E3EBF2',
  bg: '#F3F7FB',
  white: '#FFFFFF',
  error: '#B42318',
};

const SEAT = {
  available: { bg: '#EAF6FD', cushion: '#CFE8F6', border: '#7FBCDD', text: '#005F8E' },
  selected: { bg: '#0077B6', cushion: '#005F8E', border: '#005F8E', text: '#FFFFFF' },
  booked: { bg: '#E8EDF2', cushion: '#DCE3EA', border: '#D3DBE3', text: '#94A3B8' },
};

const AISLE = 30;
const GAP = 8;

// Seat layout (visual -> seat number):
// Row 1: driver front-left, seat 1 front-right. Rows 2+: 2 seats left, aisle, 2 seats right.
const buildSeatRows = (totalSeats) => {
  const total = Math.max(0, Number(totalSeats || 0));
  if (total === 0) return [];

  const rows = [
    { id: 'row-1', rowNumber: 1, leftA: null, leftB: null, rightA: 1 <= total ? 1 : null, rightB: null },
  ];

  let cursor = 2;
  let rowNumber = 2;
  while (cursor <= total) {
    rows.push({
      id: `row-${rowNumber}`,
      rowNumber,
      leftA: cursor <= total ? cursor : null,
      leftB: cursor + 1 <= total ? cursor + 1 : null,
      rightA: cursor + 2 <= total ? cursor + 2 : null,
      rightB: cursor + 3 <= total ? cursor + 3 : null,
    });
    cursor += 4;
    rowNumber += 1;
  }
  return rows;
};

const titleCase = (str) => String(str || '').replace(/\b\w/g, (c) => c.toUpperCase());

const prettyDate = (value) => {
  const iso = String(value || '').slice(0, 10);
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return value || 'Date TBA';
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

/* ---------- presentational pieces ---------- */

function Seat({ number, state, size, onPress }) {
  const t = SEAT[state] || SEAT.booked;
  const booked = state === 'booked';
  const selected = state === 'selected';

  return (
    <Pressable
      onPress={() => onPress(number)}
      disabled={booked}
      accessibilityRole="button"
      accessibilityLabel={`Seat ${number}, ${booked ? 'booked' : selected ? 'selected' : 'available'}`}
      accessibilityState={{ disabled: booked, selected }}
      style={({ pressed }) => [
        s.seat,
        { width: size, height: size, backgroundColor: t.bg, borderColor: t.border },
        pressed && !booked && { opacity: 0.8, transform: [{ scale: 0.96 }] },
      ]}
    >
      <View style={[s.seatCushion, { backgroundColor: t.cushion }]} />
      <Text style={[s.seatNumber, { color: t.text }, booked && s.seatNumberBooked]}>{number}</Text>
      {selected ? (
        <View style={s.seatCheck}>
          <Ionicons name="checkmark" size={11} color={C.brand} />
        </View>
      ) : null}
    </Pressable>
  );
}

function EmptySlot({ size }) {
  return <View style={{ width: size, height: size }} />;
}

function DriverCell({ size }) {
  return (
    <View style={[s.driverCell, { width: size * 2 + GAP, height: size }]}>
      <View style={s.wheelIcon}>
        <MaterialCommunityIcons name="steering" size={22} color={C.white} />
      </View>
      <Text style={s.driverText}>Driver</Text>
    </View>
  );
}

function LegendItem({ state, label }) {
  const t = SEAT[state];
  return (
    <View style={s.legendItem}>
      <View style={[s.legendSwatch, { backgroundColor: t.bg, borderColor: t.border }]} />
      <Text style={s.legendText}>{label}</Text>
    </View>
  );
}

function MetaItem({ icon, text }) {
  return (
    <View style={s.metaItem}>
      <Ionicons name={icon} size={15} color={C.brandDeep} />
      <Text style={s.metaText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

/* ---------- screen ---------- */

export default function SeatMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const scheduleId = String(params?.scheduleId || '');
  const fromStop = String(params?.from || '');
  const toStop = String(params?.to || '');
  const busPlate = String(params?.busPlate || '');
  const departureTime = String(params?.departureTime || '');
  const departureDate = String(params?.departureDate || '');
  const price = Number(params?.price || 0);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [availableSeats, setAvailableSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalSeats, setTotalSeats] = useState(0);
  const hasLoaded = useRef(false);

  // Bus dimensions derive from the screen so four seats + aisle always fit.
  const busWidth = Math.min(width - 40, 380);
  const seatSize = Math.max(40, Math.min(56, Math.floor((busWidth - 83) / 4)));

  const seatState = useMemo(() => {
    const map = new Map();
    for (let seat = 1; seat <= totalSeats; seat += 1) map.set(seat, 'booked');
    availableSeats.forEach((seat) => map.set(seat, 'available'));
    selectedSeats.forEach((seat) => map.set(seat, 'selected'));
    bookedSeats.forEach((seat) => map.set(seat, 'booked'));
    return map;
  }, [totalSeats, availableSeats, bookedSeats, selectedSeats]);

  const seatRows = useMemo(() => buildSeatRows(totalSeats), [totalSeats]);

  const applySnapshot = useCallback((snapshot) => {
    const total = Math.min(Number(snapshot?.totalSeats || 0), MAX_COMMUTER_SEATS);
    const available = Array.isArray(snapshot?.availableSeats)
      ? snapshot.availableSeats
          .map((seat) => Number(seat))
          .filter((seat) => Number.isInteger(seat) && seat > 0 && seat <= total)
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
    const snapshot = await fetchSeatAvailability({ scheduleId, from: fromStop, to: toStop });
    applySnapshot(snapshot);
    setError('');
  }, [scheduleId, fromStop, toStop, applySnapshot]);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await refreshAvailability();
      hasLoaded.current = true;
    } catch (err) {
      setError(err?.message || 'Unable to load live seat availability.');
      setAvailableSeats([]);
      setBookedSeats([]);
      setSelectedSeats([]);
    } finally {
      setLoading(false);
    }
  }, [refreshAvailability]);

  // Load on focus and poll every 8s only while this screen is visible
  // (the old interval kept running behind the payment screen).
  useFocusEffect(
    useCallback(() => {
      setBooking(false); // fixes the button staying on "Loading..." after coming back from payment
      if (hasLoaded.current) refreshAvailability().catch(() => undefined);
      else loadInitial();

      const id = setInterval(() => {
        refreshAvailability().catch(() => undefined);
      }, 8000);
      return () => clearInterval(id);
    }, [loadInitial, refreshAvailability]),
  );

  const toggleSeat = (seatNumber) => {
    if (seatState.get(seatNumber) === 'booked') return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) return prev.filter((seat) => seat !== seatNumber);
      if (prev.length >= MAX_SEATS_PER_BOOKING) {
        Alert.alert('Seat limit', `You can select up to ${MAX_SEATS_PER_BOOKING} seats.`);
        return prev;
      }
      return [...prev, seatNumber];
    });
  };

  const onConfirmBooking = () => {
    if (!selectedSeats.length || booking) return;
    setBooking(true);

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

  const renderSeat = (n) =>
    n ? <Seat number={n} state={seatState.get(n)} size={seatSize} onPress={toggleSeat} /> : <EmptySlot size={seatSize} />;

  /* ----- missing params ----- */
  if (!scheduleId || !fromStop || !toStop) {
    return (
      <View style={[s.centered, { paddingTop: insets.top }]}>
        <View style={s.centerIcon}>
          <Ionicons name="alert-circle-outline" size={28} color={C.brandDeep} />
        </View>
        <Text style={s.centerTitle}>Trip details missing</Text>
        <Text style={s.centerText}>Go back and search for your bus again.</Text>
        <Pressable onPress={() => router.back()} style={s.primaryBtn} accessibilityRole="button">
          <Text style={s.primaryBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const sortedSeats = [...selectedSeats].sort((a, b) => a - b);
  const canContinue = sortedSeats.length > 0 && !booking;
  const total = sortedSeats.length * price;
  const timeText = departureTime && departureTime !== 'TBA' ? departureTime : 'Time TBA';

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backBtn, pressed && { backgroundColor: C.brandSoft }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={C.ink} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} accessibilityRole="header">Choose your seats</Text>
          <Text style={s.headerSub} numberOfLines={1}>
            {titleCase(fromStop)} to {titleCase(toStop)}
          </Text>
        </View>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Trip summary */}
        <View style={s.summary}>
          <View style={s.routeRow}>
            <View style={s.rail}>
              <View style={[s.railDot, { backgroundColor: C.brand }]} />
              <View style={s.railDash} />
              <View style={[s.railDot, s.railPin]} />
            </View>
            <View style={s.routeStops}>
              <Text style={s.stop} numberOfLines={1}>{titleCase(fromStop)}</Text>
              <Text style={s.stop} numberOfLines={1}>{titleCase(toStop)}</Text>
            </View>
            <View style={s.priceBox}>
              <Text style={s.price}>RWF {price.toLocaleString()}</Text>
              <Text style={s.priceSub}>per seat</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.metaRow}>
            <MetaItem icon="calendar-outline" text={`${prettyDate(departureDate)} · ${timeText}`} />
            {busPlate ? <MetaItem icon="bus-outline" text={busPlate} /> : null}
            {!loading && !error ? (
              <MetaItem icon="people-outline" text={`${availableSeats.length} seat${availableSeats.length === 1 ? '' : 's'} left`} />
            ) : null}
          </View>
        </View>

        {/* Legend */}
        <View style={s.legendRow}>
          <LegendItem state="available" label="Available" />
          <LegendItem state="selected" label="Selected" />
          <LegendItem state="booked" label="Booked" />
        </View>

        {/* Bus */}
        <View style={[s.busWrap, { width: busWidth }]}>
          {/* mirrors */}
          <View style={[s.mirror, { left: -8 }]} />
          <View style={[s.mirror, { right: -8 }]} />
          {/* wheels */}
          <View style={[s.wheel, s.wheelFrontL]} />
          <View style={[s.wheel, s.wheelFrontR]} />
          <View style={[s.wheel, s.wheelRearL]} />
          <View style={[s.wheel, s.wheelRearR]} />

          <View style={s.busBody}>
            <View style={s.windshield}>
              <Text style={s.windshieldText}>FRONT</Text>
            </View>

            {loading ? (
              <View style={s.loadingBox}>
                <ActivityIndicator color={C.brand} />
                <Text style={s.loadingText}>Loading seats...</Text>
              </View>
            ) : error && !seatRows.length ? (
              <View style={s.loadingBox}>
                <Ionicons name="cloud-offline-outline" size={30} color={C.muted} />
                <Text style={s.errorText}>{error}</Text>
                <Pressable onPress={loadInitial} style={s.retryBtn} accessibilityRole="button">
                  <Text style={s.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.seatsArea}>
                <View style={s.aisle} pointerEvents="none" />
                {seatRows.map((row) => (
                  <View key={row.id} style={s.seatRow}>
                    {row.rowNumber === 1 ? (
                      <DriverCell size={seatSize} />
                    ) : (
                      <View style={s.cluster}>
                        {renderSeat(row.leftA)}
                        {renderSeat(row.leftB)}
                      </View>
                    )}
                    <View style={{ width: AISLE }} />
                    <View style={s.cluster}>
                      {renderSeat(row.rightA)}
                      {renderSeat(row.rightB)}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={s.rear}>
              <Text style={s.windshieldText}>REAR</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Checkout bar */}
      <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={s.barTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.barTitle}>
              {sortedSeats.length
                ? `${sortedSeats.length} seat${sortedSeats.length > 1 ? 's' : ''} selected`
                : 'No seat selected'}
            </Text>
            <Text style={s.barSub} numberOfLines={1}>
              {sortedSeats.length ? `Seat ${sortedSeats.join(', ')}` : `Select up to ${MAX_SEATS_PER_BOOKING} seats`}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.barSub}>Total</Text>
            <Text style={s.barTotal}>RWF {total.toLocaleString()}</Text>
          </View>
        </View>

        <Pressable
          onPress={onConfirmBooking}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue, busy: booking }}
          style={({ pressed }) => [s.cta, !canContinue && s.ctaDisabled, pressed && canContinue && s.ctaPressed]}
        >
          {booking ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <>
              <Text style={s.ctaText}>{sortedSeats.length ? 'Continue to payment' : 'Select a seat to continue'}</Text>
              {sortedSeats.length ? <Ionicons name="arrow-forward" size={18} color={C.white} /> : null}
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- styles ---------- */

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.ink },
  headerSub: { marginTop: 2, fontSize: 12, color: C.muted, fontWeight: '600' },

  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, gap: 16, alignItems: 'center' },

  summary: {
    alignSelf: 'stretch',
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rail: { alignItems: 'center', height: 52, paddingVertical: 4 },
  railDot: { width: 10, height: 10, borderRadius: 5 },
  railPin: { backgroundColor: '#F59E0B', borderRadius: 2, transform: [{ rotate: '45deg' }] },
  railDash: { flex: 1, width: 0, borderLeftWidth: 1.5, borderStyle: 'dashed', borderColor: '#9CC9E2', marginVertical: 3 },
  routeStops: { flex: 1, height: 52, justifyContent: 'space-between' },
  stop: { fontSize: 16, fontWeight: '800', color: C.ink },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 17, fontWeight: '900', color: C.brand },
  priceSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.line },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 10, backgroundColor: C.brandSoft, maxWidth: '100%',
  },
  metaText: { fontSize: 12, fontWeight: '700', color: C.brandDeep, flexShrink: 1 },

  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendSwatch: { width: 18, height: 18, borderRadius: 6, borderWidth: 1.5 },
  legendText: { fontSize: 12, color: C.sub, fontWeight: '700' },

  /* bus */
  busWrap: { marginTop: 6, position: 'relative' },
  busBody: {
    backgroundColor: C.white,
    borderWidth: 2.5,
    borderColor: '#B8C7D6',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 14,
    shadowColor: '#0B3550',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  windshield: {
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCEFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18,
  },
  windshieldText: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#5B8FAE' },
  rear: { height: 22, borderRadius: 8, backgroundColor: '#EEF3F8', alignItems: 'center', justifyContent: 'center' },

  mirror: { position: 'absolute', top: 56, width: 10, height: 20, borderRadius: 4, backgroundColor: '#475569' },
  wheel: { position: 'absolute', width: 8, height: 50, borderRadius: 4, backgroundColor: '#334155' },
  wheelFrontL: { left: -5, top: 110 },
  wheelFrontR: { right: -5, top: 110 },
  wheelRearL: { left: -5, bottom: 70 },
  wheelRearR: { right: -5, bottom: 70 },

  seatsArea: { position: 'relative', gap: 10 },
  aisle: {
    position: 'absolute', top: 0, bottom: 0, left: '50%', marginLeft: -AISLE / 2, width: AISLE,
    backgroundColor: '#F1F5F9', borderRadius: 8,
  },
  seatRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  cluster: { flexDirection: 'row', gap: GAP },

  seat: {
    borderWidth: 1.5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  seatCushion: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%' },
  seatNumber: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  seatNumberBooked: { textDecorationLine: 'line-through', fontWeight: '700' },
  seatCheck: {
    position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 8,
    backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
  },

  driverCell: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  wheelIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  driverText: { fontSize: 11, fontWeight: '800', color: C.muted },

  loadingBox: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 60, paddingHorizontal: 12 },
  loadingText: { color: C.muted, fontSize: 13 },
  errorText: { color: C.error, fontSize: 13, textAlign: 'center', fontWeight: '600' },
  retryBtn: { minHeight: 44, paddingHorizontal: 18, borderRadius: 12, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  retryText: { color: C.brandDeep, fontWeight: '800', fontSize: 14 },

  /* checkout bar */
  bar: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    shadowColor: '#0B3550',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 12,
  },
  barTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  barSub: { fontSize: 12, color: C.muted, fontWeight: '600', marginTop: 2 },
  barTotal: { fontSize: 18, fontWeight: '900', color: C.brand },
  cta: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: C.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  ctaDisabled: { backgroundColor: '#9DB6C7' },
  ctaPressed: { backgroundColor: C.brandDeep },
  ctaText: { color: C.white, fontSize: 16, fontWeight: '800' },

  /* missing params */
  centered: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  centerIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  centerTitle: { fontSize: 18, fontWeight: '800', color: C.ink },
  centerText: { fontSize: 14, color: C.sub, textAlign: 'center' },
  primaryBtn: { minHeight: 48, borderRadius: 12, backgroundColor: C.brand, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  primaryBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },
});