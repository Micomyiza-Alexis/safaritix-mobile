import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/config/api';
import Logo from '@/components/Logo';
import { Button, Card, EmptyState, Pill, SectionTitle, Skeleton } from '@/components/ui';
import { color, space, toLocalISO, type } from '@/theme';

type Trip = {
  schedule_id: string; route_id: string; bus_id: string; bus_plate: string; company_name: string;
  pickup_stop: string; dropoff_stop: string; departure_date: string | null; departure_time: string | null;
  available_seats: number; price: number;
};

// Shortcuts that only prefill the search form. They carry no prices, times or availability.
// NOTE: stop names must match what /search-trips expects; edit this list to your real routes.
const ROUTE_SHORTCUTS = [
  { from: 'Kigali', to: 'Huye', tint: '#005F8E' },
  { from: 'Kigali', to: 'Musanze', tint: '#0077B6' },
  { from: 'Kigali', to: 'Rubavu', tint: '#0B3550' },
  { from: 'Kigali', to: 'Rusizi', tint: '#005F8E' },
  { from: 'Kigali', to: 'Nyagatare', tint: '#0077B6' },
] as const;

const STEPS = [
  { icon: 'grid-outline', title: 'Pick your seat' },
  { icon: 'shield-checkmark-outline', title: 'Pay securely' },
  { icon: 'navigate-outline', title: 'Track your bus' },
] as const;

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const nextSaturday = () => { const d = new Date(); const diff = (6 - d.getDay() + 7) % 7; d.setDate(d.getDate() + diff); return d; };
const prettyDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

const normalizeTrip = (t: any, from: string, to: string): Trip => ({
  schedule_id: String(t.schedule_id || t.scheduleId || t.id || ''),
  route_id: t.route_id || t.routeId || '',
  bus_id: t.bus_id || t.busId || '',
  bus_plate: t.bus_plate || t.plate_number || t.busPlate || '',
  company_name: t.company_name || t.companyName || 'SafariTix operator',
  pickup_stop: t.pickup_stop || t.from_stop || t.from || from,
  dropoff_stop: t.dropoff_stop || t.to_stop || t.to || to,
  departure_date: t.departure_date || t.date || null,
  departure_time: t.departure_time || t.time || null,
  available_seats: Number(t.available_seats ?? t.seatsAvailable ?? t.availableSeats ?? 0),
  price: Number(t.price ?? 0),
});

/* ---------- presentational pieces ---------- */

function PanelField({
  label, value, onChangeText, placeholder, inputRef, onSubmit, returnKeyType = 'next', trailing, keyboardType, autoCapitalize = 'words',
}: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder: string;
  inputRef?: React.RefObject<TextInput | null>; onSubmit?: () => void;
  returnKeyType?: 'next' | 'search'; trailing?: string;
  keyboardType?: 'default' | 'numbers-and-punctuation'; autoCapitalize?: 'none' | 'words';
}) {
  const [focus, setFocus] = useState(false);
  return (
    <Pressable style={s.pfield} onPress={() => inputRef?.current?.focus()} accessible={false}>
      <View style={{ flex: 1 }}>
        <Text style={[s.pLabel, focus && { color: color.brand }]}>{label}</Text>
        <TextInput
          ref={inputRef as any}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8A9AA9"
          style={s.pInput}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          accessibilityLabel={label.charAt(0) + label.slice(1).toLowerCase()}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmit}
          blurOnSubmit={returnKeyType === 'search'}
        />
      </View>
      {trailing ? <Text style={s.pTrailing}>{trailing}</Text> : null}
    </Pressable>
  );
}

function RouteCard({ from, to, tint, onPress }: { from: string; to: string; tint: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Search ${from} to ${to}`}
      style={({ pressed }) => [s.routeCard, { backgroundColor: tint }, pressed && { opacity: 0.88 }]}
    >
      <View style={s.arcOuter} />
      <View style={s.arcInner} />
      <Text style={s.routeFrom}>From {from}</Text>
      <View style={{ flex: 1 }} />
      <View style={s.routeBottom}>
        <Text style={s.routeTo} numberOfLines={1}>{to}</Text>
        <View style={s.routeArrow}>
          <Ionicons name="arrow-forward" size={16} color="#005F8E" />
        </View>
      </View>
    </Pressable>
  );
}


function TripResult({
  trip,
  onSelect,
}: {
  trip: Trip;
  onSelect: (t: Trip) => void;
}) {
  const low = trip.available_seats > 0 && trip.available_seats <= 5;
  const soldOut = trip.available_seats <= 0;

  return (
    <Card style={s.tripCard}>
      {/* Operator and price */}
      <View style={s.tripCardHeader}>
        <View style={s.tripOperator}>
          <View style={s.tripBusIcon}>
            <Ionicons name="bus-outline" size={21} color={color.brand} />
          </View>

          <View style={s.tripOperatorInfo}>
            <Text style={s.tripCompany} numberOfLines={1}>
              {trip.company_name || "Bus operator"}
            </Text>
            {!!trip.bus_plate && (
              <Text style={s.tripPlate}>{trip.bus_plate}</Text>
            )}
          </View>
        </View>

        <View style={s.tripPriceBlock}>
          <Text style={[s.tripPrice, type.num]}>
            {`RWF ${trip.price.toLocaleString()}`}
          </Text>
          <Text style={s.tripPer}>per seat</Text>
        </View>
      </View>

      <View style={s.tripCardDivider} />

      {/* Departure time and route */}
      <View style={s.tripJourney}>
        <View style={s.tripDeparture}>
          <Text style={s.tripTime}>
            {trip.departure_time || "Time TBA"}
          </Text>
          <Text style={s.tripTimeCaption}>Departure</Text>
        </View>

        <View style={s.tripRouteVisual}>
          <View style={[s.tripRouteDot, { backgroundColor: color.brand }]} />
          <View style={s.tripRouteDash} />
          <Ionicons
            name="bus-outline"
            size={17}
            color={color.brand}
          />
          <View style={s.tripRouteDash} />
          <View style={[s.tripRouteDot, { backgroundColor: color.sun }]} />
        </View>

        <View style={s.tripStops}>
          <Text style={s.tripStop} numberOfLines={1}>
            {trip.pickup_stop}
          </Text>
          <Text style={s.tripStop} numberOfLines={1}>
            {trip.dropoff_stop}
          </Text>
        </View>
      </View>

      <View style={s.tripCardDivider} />

      {/* Availability and action */}
      <View style={s.tripCardFooter}>
        <View style={s.tripAvailability}>
          <View
            style={[
              s.tripAvailabilityDot,
              {
                backgroundColor: soldOut
                  ? "#D64545"
                  : low
                    ? "#E89A22"
                    : "#1C9A68",
              },
            ]}
          />
          <Text
            style={[
              s.tripAvailabilityText,
              soldOut && { color: "#D64545" },
              low && { color: "#B87512" },
            ]}
          >
            {soldOut
              ? "Sold out"
              : low
                ? `Only ${trip.available_seats} left`
                : `${trip.available_seats} seats available`}
          </Text>
        </View>

        <Button
          title={soldOut ? "Unavailable" : "Select trip"}
          icon="arrow-forward"
          compact
          disabled={soldOut}
          onPress={() => onSelect(trip)}
        />
      </View>
    </Card>
  );
}

/* ---------- screen ---------- */

export default function HomeScreen() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(toLocalISO(new Date()));
  const [results, setResults] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const resultsY = useRef(0);
  const scroller = useRef<ScrollView>(null);
  const toRef = useRef<TextInput>(null);
  const dateRef = useRef<TextInput>(null);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(); }, [fade]);

  const quick = [
    { label: 'Today', iso: toLocalISO(new Date()) },
    { label: 'Tomorrow', iso: toLocalISO(addDays(1)) },
    { label: 'Weekend', iso: toLocalISO(nextSaturday()) },
  ];

  const swap = () => { setFrom(to); setTo(from); };

  const useShortcut = (r: { from: string; to: string }) => {
    setFrom(r.from); setTo(r.to); setHint('');
    scroller.current?.scrollTo({ y: 0, animated: true });
  };

  const search = async () => {
    const f = from.trim(), t = to.trim(), d = date.trim();
    if (!f || !t || !d) { setHint('Enter where from, where to, and a date.'); return; }
    if (f.toLowerCase() === t.toLowerCase()) { setHint('Origin and destination cannot be the same.'); return; }
    setHint(''); setError(''); setSearched(true); setLoading(true);
    setTimeout(() => scroller.current?.scrollTo({ y: Math.max(0, resultsY.current - 12), animated: true }), 80);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      if (!API_BASE_URL) throw new Error('API is not configured. Please check your connection settings.');
      const q = new URLSearchParams({ from: f, to: t, date: d });
      const res = await fetch(`${API_BASE_URL}/search-trips?${q}`, { headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || payload?.error || `Server error (${res.status}): unable to search buses`);
      const trips = Array.isArray(payload?.trips) ? payload.trips : [];
      setResults(trips.map((x: any) => normalizeTrip(x, f, t)).filter((x: Trip) => Boolean(x.schedule_id)));
    } catch (e: any) {
      setResults([]);
      setError(e?.name === 'AbortError' ? 'The search timed out. Please try again.' : e?.message || 'Network error. Check your connection and try again.');
    } finally { clearTimeout(timer); setLoading(false); }
  };

  const select = (trip: Trip) => router.push({
    pathname: '/seat-map',
    params: {
      scheduleId: trip.schedule_id, busId: trip.bus_id, busPlate: trip.bus_plate,
      from: trip.pickup_stop || from, to: trip.dropoff_stop || to,
      departureDate: trip.departure_date || date, departureTime: trip.departure_time || '',
      routeId: trip.route_id, price: String(trip.price || 0),
    },
  });

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={TINT} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scroller}
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <LinearGradient colors={[TINT, '#F3FAFD', '#FFFFFF']} style={s.topBg} pointerEvents="none" />

          {/* Header */}
          <View style={s.topBar}>
            <View style={s.logoTile}>
              <Logo width={46} height={52} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="My tickets"
              onPress={() => router.navigate('/trips')}
              style={({ pressed }) => [s.ticketBtn, pressed && { backgroundColor: '#D3EBF7' }]}
            >
              <Ionicons name="ticket-outline" size={18} color="#005F8E" />
              <Text style={s.ticketBtnText}>My tickets</Text>
            </Pressable>
          </View>

          <Animated.View style={{ opacity: fade }}>
            {/* Editorial headline */}
            <View style={s.headlineWrap}>
              <Text style={s.headline} accessibilityRole="header">
                Where are you{'\n'}
                <Text style={s.headlineAccent}>going today?</Text>
              </Text>
              <Text style={s.lede}>Search buses, choose your seat and keep your ticket on your phone.</Text>
            </View>

            {/* Booking panel */}
            <View style={s.panel}>
              <View style={s.routeBlock}>
                <View style={s.rail}>
                  <View style={[s.railDot, { backgroundColor: color.brand }]} />
                  <View style={s.railDash} />
                  <View style={[s.railDot, s.railPin]} />
                </View>

                <View style={{ flex: 1 }}>
                  <PanelField
                    label="FROM" value={from} onChangeText={setFrom} placeholder="Departure city"
                    onSubmit={() => toRef.current?.focus()}
                  />
                  <View style={s.hair} />
                  <PanelField
                    label="TO" value={to} onChangeText={setTo} placeholder="Destination city"
                    inputRef={toRef} onSubmit={() => dateRef.current?.focus()}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Swap origin and destination"
                  onPress={swap}
                  hitSlop={6}
                  style={({ pressed }) => [s.swap, pressed && { backgroundColor: '#E6F4FB' }]}
                >
                  <Ionicons name="swap-vertical" size={20} color={color.brand} />
                </Pressable>
              </View>

              <View style={s.hairFull} />

              <View style={s.dateBlock}>
                <Ionicons name="calendar-outline" size={20} color="#005F8E" style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <PanelField
                    label="DEPARTURE DATE" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"
                    inputRef={dateRef} returnKeyType="search" onSubmit={search}
                    keyboardType="numbers-and-punctuation" autoCapitalize="none"
                    trailing={ISO_RE.test(date.trim()) ? prettyDate(date.trim()) : undefined}
                  />
                </View>
              </View>

              <View style={s.segment} accessibilityRole="tablist">
                {quick.map((q) => {
                  const on = date === q.iso;
                  return (
                    <Pressable
                      key={q.label}
                      onPress={() => setDate(q.iso)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      style={[s.segItem, on && s.segItemOn]}
                    >
                      <Text style={[s.segText, on && s.segTextOn]}>{q.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Button title="Search buses" icon="search" variant="sun" onPress={search} loading={loading} />

              {hint ? (
                <View style={s.hintRow} accessibilityLiveRegion="polite">
                  <Ionicons name="alert-circle" size={16} color="#B45309" />
                  <Text style={s.hint}>{hint}</Text>
                </View>
              ) : null}
            </View>
          </Animated.View>

          {/* Results */}
          <View onLayout={(e) => { resultsY.current = e.nativeEvent.layout.y; }} style={{ gap: space.md }}>
            {searched ? (
              <>
                <SectionTitle
                  title={
                    loading
                      ? 'Finding your ride...'
                      : results.length
                        ? `${results.length} bus${results.length > 1 ? 'es' : ''} · ${prettyDate(date)}`
                        : 'Search results'
                  }
                />
                {loading ? (
                  <>
                    <Skeleton height={176} />
                    <Skeleton height={176} />
                  </>
                ) : error ? (
                  <Card>
                    <EmptyState icon="cloud-offline-outline" title="Couldn't load buses" text={error} actionLabel="Try again" onAction={search} />
                  </Card>
                ) : results.length === 0 ? (
                  <Card>
                    <EmptyState icon="calendar-outline" title="No buses found" text="Try another travel date or check your route." />
                  </Card>
                ) : (
                  results.map((trip) => <TripResult key={trip.schedule_id} trip={trip} onSelect={select} />)
                )}
              </>
            ) : null}
          </View>

          {/* Discovery (before first search) */}
          {!searched ? (
            <>
              <View>
                <View style={s.sectionHead}>
                  <Text style={s.sectionTitle}>Start from a route</Text>
                  <Text style={s.sectionSub}>Tap to fill in your trip</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={s.routeRow}
                  style={s.routeScroll}
                >
                  {ROUTE_SHORTCUTS.map((r) => (
                    <RouteCard key={`${r.from}-${r.to}`} from={r.from} to={r.to} tint={r.tint} onPress={() => useShortcut(r)} />
                  ))}
                </ScrollView>
              </View>

              <View style={s.trust}>
                {STEPS.map((p, i) => (
                  <View key={p.title} style={[s.trustItem, i > 0 && s.trustDivider]}>
                    <View style={s.trustIcon}>
                      <Ionicons name={p.icon} size={20} color="#005F8E" />
                    </View>
                    <Text style={s.trustText}>{p.title}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */

const INK = '#0B2236';
const TINT = '#E3F3FB';

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: TINT },
  scroll: { backgroundColor: '#FFFFFF' },
  topBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 330 },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 44, gap: 28 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoTile: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#CFE6F3',
    shadowColor: '#0B3550', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  ticketBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 44,
    paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CFE6F3',
  },
  ticketBtnText: { color: '#005F8E', fontSize: 14, fontWeight: '800' },

  headlineWrap: { gap: 10, marginTop: -4, marginBottom: 22 },
  headline: { color: INK, fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.8 },
  headlineAccent: { color: '#0077B6' },
  lede: { color: '#526779', fontSize: 15, lineHeight: 22, maxWidth: 320 },

  panel: {
    backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, gap: 14,
    borderWidth: 1, borderColor: '#DCE6EE',
    shadowColor: '#0B3550', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.09, shadowRadius: 20, elevation: 5,
  },
  routeBlock: { flexDirection: 'row', alignItems: 'center' },
  rail: { width: 22, height: 121, alignItems: 'center', paddingVertical: 25, marginRight: 10 },
  railDot: { width: 10, height: 10, borderRadius: 5 },
  railPin: { backgroundColor: color.sun, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  railDash: { flex: 1, width: 0, borderLeftWidth: 1.5, borderStyle: 'dashed', borderColor: '#9CC9E2', marginVertical: 4 },
  pfield: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pLabel: { color: '#6B7C8C', fontSize: 11, fontWeight: '700', marginBottom: 2 },
  pInput: { color: INK, fontSize: 17, fontWeight: '700', paddingHorizontal: 0, paddingVertical: 2, includeFontPadding: false },
  pTrailing: { color: '#005F8E', fontSize: 13, fontWeight: '700', marginLeft: 8 },
  hair: { height: 1, backgroundColor: '#E3EBF2' },
  hairFull: { height: 1, backgroundColor: '#E3EBF2' },
  swap: {
    width: 44, height: 44, borderRadius: 22, marginLeft: 8, backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#BFDDEE', alignItems: 'center', justifyContent: 'center',
  },
  dateBlock: { flexDirection: 'row', alignItems: 'center', paddingLeft: 2 },

  segment: { flexDirection: 'row', backgroundColor: '#EEF3F8', borderRadius: 14, padding: 4 },
  segItem: { flex: 1, minHeight: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segItemOn: { backgroundColor: '#FFFFFF', shadowColor: '#0B3550', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segText: { color: '#526779', fontSize: 13, fontWeight: '700' },
  segTextOn: { color: '#005F8E' },

  hintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  hint: { color: '#B45309', fontSize: 13, fontWeight: '700', flexShrink: 1 },

  sectionHead: { marginBottom: 14, gap: 3 },
  sectionTitle: { color: INK, fontSize: 21, fontWeight: '800', letterSpacing: -0.4 },
  sectionSub: { color: '#6B7C8C', fontSize: 13 },
  routeScroll: { marginHorizontal: -20 },
  routeRow: { paddingHorizontal: 20, gap: 12 },
  routeCard: { width: 170, height: 132, borderRadius: 20, padding: 16, overflow: 'hidden' },
  arcOuter: { position: 'absolute', right: -50, top: -50, width: 140, height: 140, borderRadius: 70, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.16)' },
  arcInner: { position: 'absolute', right: -20, top: -20, width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.22)' },
  routeFrom: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  routeBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  routeTo: { flex: 1, color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  routeArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },

  trust: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E3EBF2', paddingVertical: 16 },
  trustItem: { flex: 1, alignItems: 'center', gap: 8, paddingHorizontal: 6 },
  trustDivider: { borderLeftWidth: 1, borderLeftColor: '#E3EBF2' },
  trustIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E6F4FB', alignItems: 'center', justifyContent: 'center' },
  trustText: { color: INK, fontSize: 12, fontWeight: '700', textAlign: 'center' },

  tripTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  tripTime: { fontSize: 24, fontWeight: '800', color: color.ink, letterSpacing: -0.5 },
  tripCompany: { ...type.small, color: color.sub, marginTop: 3 },
  tripPrice: { fontSize: 18, fontWeight: '900', color: color.brand },
  tripPer: { ...type.small, color: color.muted, fontSize: 11 },
  tripRoute: { flexDirection: 'row', gap: space.md, paddingVertical: 2 },
  tripRail: { alignItems: 'center', paddingVertical: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  railLine: { flex: 1, width: 0, borderLeftWidth: 1.5, borderStyle: 'dashed', borderColor: color.brandMid, marginVertical: 3 },
  stop: { fontSize: 15, fontWeight: '700', color: color.ink },
  tripFoot: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: color.lineSoft, paddingTop: space.md, gap: 8,
  },

  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 17,
    gap: 14,
    borderWidth: 1,
    borderColor: "#E4EBF1",
    shadowColor: "#102A43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.045,
    shadowRadius: 12,
    elevation: 2,
  },
  tripCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  tripOperator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  tripBusIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#E6F4FB",
    alignItems: "center",
    justifyContent: "center",
  },
  tripOperatorInfo: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  tripPlate: {
    color: "#718496",
    fontSize: 11,
    fontWeight: "600",
  },
  tripPriceBlock: {
    alignItems: "flex-end",
    gap: 3,
  },
  tripCardDivider: {
    height: 1,
    backgroundColor: "#EDF1F5",
  },
  tripJourney: {
    gap: 12,
  },
  tripDeparture: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  tripTimeCaption: {
    color: "#8494A3",
    fontSize: 11,
    fontWeight: "500",
  },
  tripRouteVisual: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 2,
  },
  tripRouteDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  tripRouteDash: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderTopWidth: 1,
    borderColor: "#C9D6E0",
  },
  tripStops: {
    gap: 8,
  },
  tripStop: {
    color: "#183247",
    fontSize: 14,
    fontWeight: "700",
  },
  tripCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  tripAvailability: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minWidth: 0,
  },
  tripAvailabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tripAvailabilityText: {
    color: "#1C895E",
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
});
