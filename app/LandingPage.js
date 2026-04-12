import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../config/api';
import Logo from '../components/Logo';

const { width } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  // Brand
  primary: '#0077B6',
  primaryDark: '#005E90',
  primaryLight: '#E0F2FE',
  primaryMid: '#BAE6FD',
  accent: '#F4A261',
  accentLight: '#FEF3E2',
  success: '#22C55E',
  successLight: '#DCFCE7',
  danger: '#EF4444',
  // Neutrals
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  // Text
  text: '#0F172A',
  textSub: '#334155',
  muted: '#64748B',
  mutedLight: '#94A3B8',
  white: '#FFFFFF',
};

const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40,
};

const RADIUS = {
  sm: 10, md: 14, lg: 20, xl: 24, full: 999,
};

const SHADOW = {
  sm: {
    shadowColor: '#0077B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  blue: {
    shadowColor: '#0077B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 14,
    elevation: 6,
  },
};

// ─── Nav Items ────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { key: 'home',    label: 'Home',       icon: 'home-outline',     primary: false },
  { key: 'search',  label: 'Search Bus', icon: 'search-outline',   primary: true  },
  { key: 'tickets', label: 'My Tickets', icon: 'receipt-outline',  primary: false },
  { key: 'track',   label: 'Track Bus',  icon: 'navigate-outline', primary: false },
  { key: 'contact', label: 'Contact Us', icon: 'call-outline',     primary: false },
];

const FEATURES = [
  {
    icon: 'flash-outline',
    title: 'Instant Booking',
    desc: 'Reserve your seat in under 30 seconds.',
    color: '#0077B6',
    bg: '#E0F2FE',
  },
  {
    icon: 'location-outline',
    title: 'Live Tracking',
    desc: 'Follow your bus in real-time on the map.',
    color: '#F4A261',
    bg: '#FEF3E2',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Secure Payments',
    desc: 'Bank-level encryption on every transaction.',
    color: '#22C55E',
    bg: '#DCFCE7',
  },
  {
    icon: 'close-circle-outline',
    title: 'Easy Cancellation',
    desc: 'Cancel eligible trips anytime, hassle-free.',
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
];

const STATS = [
  { value: '50K+', label: 'Tickets Sold' },
  { value: '120+', label: 'Routes'       },
  { value: '4.8★', label: 'Rating'       },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Header({ onMenuPress }) {
  return (
    <View style={styles.header}>
      <Logo width={287} height={95} />
      <Pressable
        onPress={onMenuPress}
        style={({ pressed }) => [styles.menuButton, pressed && styles.pressed96]}
        accessibilityLabel="Open navigation menu"
        accessibilityRole="button"
      >
        <Ionicons name="menu" size={22} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

function SlideMenu({ mounted, slideAnim, overlayAnim, onClose, onSelectItem }) {
  if (!mounted) return null;
  return (
    <View style={styles.menuOverlayContainer} pointerEvents="box-none">
      <Animated.View style={[styles.menuBackdrop, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.menuPanel, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.menuTopRow}>
          <Logo width={266} height={88} />
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed96]}
            accessibilityLabel="Close menu"
          >
            <Ionicons name="close" size={20} color={COLORS.text} />
          </Pressable>
        </View>
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => onSelectItem(item)}
              style={({ pressed }) => [
                styles.menuItem,
                item.primary && styles.menuItemPrimary,
                pressed && styles.pressed97,
              ]}
              accessibilityRole="menuitem"
            >
              <View style={[styles.menuIconWrap, item.primary && styles.menuIconWrapPrimary]}>
                <Ionicons name={item.icon} size={18} color={item.primary ? COLORS.white : COLORS.primary} />
              </View>
              <Text style={[styles.menuItemText, item.primary && styles.menuItemTextPrimary]}>
                {item.label}
              </Text>
              {!item.primary && (
                <Ionicons name="chevron-forward" size={15} color={COLORS.mutedLight} style={{ marginLeft: 'auto' }} />
              )}
            </Pressable>
          ))}
        </View>
        <View style={styles.menuFooter}>
          <Text style={styles.menuFooterText}>SafariTix · Rwanda's Travel Platform</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function PrimaryButton({ label, onPress, icon, variant = 'primary', style: styleProp }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to) =>
    Animated.spring(scale, { toValue: to, friction: 8, tension: 130, useNativeDriver: true }).start();

  const isPrimary = variant === 'primary';
  const isGhost   = variant === 'ghost';

  return (
    <Pressable
      onPressIn={() => press(0.96)}
      onPressOut={() => press(1)}
      onPress={onPress}
      style={[{ width: '100%' }, styleProp]}
      accessibilityRole="button"
    >
      <Animated.View style={[
        styles.btn,
        isPrimary  && styles.btnPrimary,
        !isPrimary && !isGhost && styles.btnSecondary,
        isGhost    && styles.btnGhost,
        { transform: [{ scale }] },
        isPrimary && SHADOW.blue,
      ]}>
        <Text style={[styles.btnText, !isPrimary && styles.btnTextAlt]}>
          {label}
        </Text>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isPrimary ? COLORS.white : COLORS.primary}
            style={{ marginLeft: 6 }}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

function InputField({ value, onChangeText, placeholder, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      {icon && <Ionicons name={icon} size={17} color={focused ? COLORS.primary : COLORS.mutedLight} style={{ marginRight: 8 }} />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.mutedLight}
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={placeholder}
      />
    </View>
  );
}

function TripCard({ trip, onSelect }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to) =>
    Animated.spring(scale, { toValue: to, friction: 8, tension: 130, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.tripCard, SHADOW.md, { transform: [{ scale }] }]}>
      {/* Route Row */}
      <View style={styles.tripRouteRow}>
        <View style={styles.tripRouteStop}>
          <View style={[styles.tripDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.tripStopText} numberOfLines={1}>{trip.pickup_stop}</Text>
        </View>
        <View style={styles.tripArrowLine}>
          <View style={styles.tripLine} />
          <Ionicons name="arrow-forward" size={13} color={COLORS.mutedLight} />
        </View>
        <View style={styles.tripRouteStop}>
          <View style={[styles.tripDot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.tripStopText} numberOfLines={1}>{trip.dropoff_stop}</Text>
        </View>
      </View>

      {/* Meta Row */}
      <View style={styles.tripMetaRow}>
        <View style={styles.tripMetaItem}>
          <Ionicons name="bus-outline" size={13} color={COLORS.muted} />
          <Text style={styles.tripMetaText}>{trip.bus_plate || 'TBA'}</Text>
        </View>
        <View style={styles.tripMetaItem}>
          <Ionicons name="time-outline" size={13} color={COLORS.muted} />
          <Text style={styles.tripMetaText}>{trip.departure_time || 'TBA'}</Text>
        </View>
        <View style={styles.tripMetaItem}>
          <Ionicons name="people-outline" size={13} color={COLORS.muted} />
          <Text style={styles.tripMetaText}>{trip.available_seats} seats</Text>
        </View>
      </View>

      {/* Bottom Row */}
      <View style={styles.tripBottomRow}>
        <View>
          <Text style={styles.tripCompany}>{trip.company_name}</Text>
          <Text style={styles.tripPrice}>RWF {trip.price.toLocaleString()}</Text>
        </View>
        <Pressable
          onPressIn={() => press(0.96)}
          onPressOut={() => press(1)}
          onPress={() => onSelect(trip)}
          style={styles.tripSelectBtn}
          accessibilityRole="button"
          accessibilityLabel={`Select seat for ${trip.pickup_stop} to ${trip.dropoff_stop}`}
        >
          <Text style={styles.tripSelectBtnText}>Select Seat</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function FeatureCard({ icon, title, desc, color, bg }) {
  return (
    <View style={[styles.featureCard, SHADOW.sm]}>
      <View style={[styles.featureIconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

function PhoneMockup({ anim, rotate, scale, phoneIndex, content }) {
  const { translateY: ty } = anim;
  const animStyle = {
    transform: [{ translateY: ty }, { scale }, { rotate }],
  };
  const isCenter = phoneIndex === 1;
  return (
    <Pressable activeOpacity={0.9}>
      <Animated.View style={[styles.phoneShell, isCenter && styles.phoneCenterShell, animStyle, SHADOW.lg]}>
        <View style={styles.phoneScreen}>
          <View style={styles.phoneNotch} />
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.phoneHeader}
          >
            <Text style={styles.phoneHeaderTitle}>{content.title}</Text>
          </LinearGradient>
          <View style={styles.phoneBody}>{content.body}</View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Mock Phone Screen Bodies ──────────────────────────────────────────────────
const PHONE_SCREENS = [
  {
    title: 'Search Bus',
    body: (
      <View style={{ gap: 6 }}>
        {['From: Kigali', 'To: Butare', 'Date: Tomorrow'].map((val, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 7 }}>
            <Ionicons name={['locate-outline','navigate-outline','calendar-outline'][i]} size={9} color={COLORS.primary} />
            <Text style={{ fontSize: 10, color: COLORS.text, fontWeight: '500' }}>{val}</Text>
          </View>
        ))}
        <View style={{ backgroundColor: COLORS.primary, borderRadius: 6, paddingVertical: 7, alignItems: 'center' }}>
          <Text style={{ color: COLORS.white, fontSize: 11, fontWeight: '600' }}>Search →</Text>
        </View>
      </View>
    ),
  },
  {
    title: 'Results',
    body: (
      <View style={{ gap: 6 }}>
        {[['Volcano Express', 'RWF 3,500', '10:00 AM'], ['Ritco Coaches', 'RWF 4,000', '11:30 AM']].map(
          ([name, price, time], i) => (
            <View key={i} style={{ backgroundColor: COLORS.surface, borderRadius: 8, padding: 8, gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.text }}>{name}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>{price}</Text>
              </View>
              <Text style={{ fontSize: 10, color: COLORS.muted }}>{time}</Text>
              <View style={{ backgroundColor: COLORS.primary, borderRadius: 5, paddingVertical: 5, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.white }}>Select</Text>
              </View>
            </View>
          )
        )}
      </View>
    ),
  },
  {
    title: 'Ticket',
    body: (
      <View style={{ backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, gap: 6 }}>
        <Text style={{ fontSize: 9, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.5 }}>ROUTE</Text>
        <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.text }}>Kigali → Butare</Text>
        <Text style={{ fontSize: 9, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.5, marginTop: 4 }}>SEAT</Text>
        <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.text }}>B12</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.successLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, marginTop: 4 }}>
          <Ionicons name="checkmark-circle" size={10} color={COLORS.success} />
          <Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.success }}>Confirmed</Text>
        </View>
        <Text style={{ fontSize: 9, color: COLORS.muted, marginTop: 4 }}>Show this at boarding</Text>
      </View>
    ),
  },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();

  const [fromLocation,  setFromLocation]  = useState('');
  const [toLocation,    setToLocation]    = useState('');
  const [travelDate,    setTravelDate]    = useState('');
  const [formMessage,   setFormMessage]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError,   setSearchError]   = useState('');
  const [hasSearched,   setHasSearched]   = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);

  const floatAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const phoneScales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const heroFade  = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(22)).current;

  const menuWidth    = Math.min(width * 0.76, 320);
  const menuSlideAnim   = useRef(new Animated.Value(menuWidth)).current;
  const menuOverlayAnim = useRef(new Animated.Value(0)).current;

  // Hero entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade,  { toValue: 1, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  // Phone float loops
  useEffect(() => {
    const loops = floatAnims.map((anim, idx) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 200),
          Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      loop.start();
      return loop;
    });
    return () => loops.forEach((l) => l.stop());
  }, [floatAnims]);

  const getFloatStyle = (index, rotate = '0deg') => ({
    transform: [
      { translateY: floatAnims[index].interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
      { scale: phoneScales[index] },
      { rotate },
    ],
  });

  const setQuickDate = (mode) => {
    const now = new Date();
    if (mode === 'today') {
      setTravelDate(now.toISOString().slice(0, 10));
    } else if (mode === 'tomorrow') {
      const d = new Date(now.getTime() + 86400000);
      setTravelDate(d.toISOString().slice(0, 10));
    } else {
      const d = new Date(now);
      const day = d.getDay();
      d.setDate(d.getDate() + (day === 6 ? 0 : day === 0 ? 6 : 6 - day));
      setTravelDate(d.toISOString().slice(0, 10));
    }
  };

  const normalizeTrip = (trip) => ({
    schedule_id:    String(trip.schedule_id || trip.scheduleId || trip.id || ''),
    route_id:       trip.route_id       || trip.routeId    || '',
    bus_id:         trip.bus_id         || trip.busId      || '',
    bus_plate:      trip.bus_plate      || trip.plate_number || trip.busPlate || '',
    company_name:   trip.company_name   || trip.companyName || 'SafariTix operator',
    pickup_stop:    trip.pickup_stop    || trip.from_stop  || trip.from  || fromLocation,
    dropoff_stop:   trip.dropoff_stop   || trip.to_stop    || trip.to    || toLocation,
    departure_date: trip.departure_date || trip.date       || null,
    departure_time: trip.departure_time || trip.time       || null,
    available_seats: Number(trip.available_seats ?? trip.seatsAvailable ?? trip.availableSeats ?? 0),
    price:           Number(trip.price ?? 0),
  });

  const handleFindBus = async () => {
    if (!fromLocation.trim() || !toLocation.trim() || !travelDate.trim()) {
      setFormMessage('Please fill From, To, and Date to search buses.');
      return;
    }
    if (fromLocation.trim().toLowerCase() === toLocation.trim().toLowerCase()) {
      setFormMessage('Origin and destination cannot be the same.');
      return;
    }
    setFormMessage('');
    setSearchError('');
    setHasSearched(true);
    setSearchLoading(true);

    try {
      if (!API_BASE_URL) {
        throw new Error('API is not configured. Please check your connection settings.');
      }

      const query = new URLSearchParams({ from: fromLocation.trim(), to: toLocation.trim(), date: travelDate.trim() });
      const url = `${API_BASE_URL}/search-trips?${query}`;
      
      console.log('[handleFindBus] Searching:', url);
      console.log('[handleFindBus] API_BASE_URL:', API_BASE_URL);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      const payload = await response.json().catch((jsonErr) => {
        console.warn('[handleFindBus] Failed to parse JSON:', jsonErr);
        return {};
      });

      console.log('[handleFindBus] Response status:', response.status, 'Payload:', payload);

      if (!response.ok) {
        const errorMsg = payload?.message || payload?.error || `Server error (${response.status}): Unable to search buses`;
        throw new Error(errorMsg);
      }

      const trips = Array.isArray(payload?.trips) ? payload.trips : [];
      const normalized = trips.map(normalizeTrip).filter((t) => Boolean(t.schedule_id));
      setSearchResults(normalized);
      setFormMessage(
        normalized.length === 0
          ? 'No buses found for this route/date. Try another date or route.'
          : `${normalized.length} bus${normalized.length > 1 ? 'es' : ''} available.`
      );
    } catch (err) {
      const errorMsg = err?.message || 'Network error - please check your connection and try again';
      console.error('[handleFindBus] Error:', errorMsg, err);
      setSearchResults([]);
      setSearchError(errorMsg);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectTrip = (trip) => {
    router.push({
      pathname: '/seat-map',
      params: {
        scheduleId:    trip.schedule_id,
        busId:         trip.bus_id         || '',
        busPlate:      trip.bus_plate       || '',
        from:          trip.pickup_stop     || fromLocation,
        to:            trip.dropoff_stop    || toLocation,
        departureDate: trip.departure_date  || '',
        departureTime: trip.departure_time  || '',
        routeId:       trip.route_id        || '',
        price:         String(trip.price    || 0),
      },
    });
  };

  const openMenu = () => {
    setIsMenuMounted(true);
    Animated.parallel([
      Animated.timing(menuSlideAnim,   { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(menuOverlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(menuSlideAnim,   { toValue: menuWidth, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(menuOverlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setIsMenuMounted(false));
  };

  const handleMenuSelect = (item) => {
    closeMenu();
    const routes = { home: '/LandingPage', tickets: '/my-tickets', track: '/my-tickets', contact: '/contact-us' };
    if (item.key === 'search') { handleFindBus(); return; }
    if (routes[item.key]) { router.push(routes[item.key]); return; }
    router.push('/(tabs)');
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <Header onMenuPress={openMenu} />

        {/* ── HERO ── */}
        <Animated.View style={[styles.hero, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>Rwanda's #1 Bus Ticketing App</Text>
          </View>
          <Text style={styles.heroTitle}>Travel Smarter{'\n'}Across Rwanda</Text>
          <Text style={styles.heroSub}>
            Book bus tickets in seconds. Real-time tracking, secure payments, zero hassle.
          </Text>
          <View style={styles.heroStats}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{s.value}</Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── BOOKING CARD ── */}
        <View style={[styles.bookingCard, SHADOW.md]}>
          <View style={styles.bookingCardHeader}>
            <Text style={styles.cardHeading}>Quick Booking</Text>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>Find a bus</Text>
            </View>
          </View>

          <InputField
            value={fromLocation}
            onChangeText={setFromLocation}
            placeholder="From — departure city"
            icon="locate-outline"
          />
          <InputField
            value={toLocation}
            onChangeText={setToLocation}
            placeholder="To — destination"
            icon="navigate-outline"
          />
          <InputField
            value={travelDate}
            onChangeText={setTravelDate}
            placeholder="Date (YYYY-MM-DD)"
            icon="calendar-outline"
          />

          <View style={styles.quickDates}>
            {['Today', 'Tomorrow', 'Weekend'].map((label) => (
              <Pressable
                key={label}
                onPress={() => setQuickDate(label.toLowerCase())}
                style={({ pressed }) => [styles.datePill, pressed && styles.datePillPressed]}
                accessibilityRole="button"
              >
                <Text style={styles.datePillText}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton label="Search Buses" icon="arrow-forward" onPress={handleFindBus} />

          {formMessage ? (
            <View style={styles.formMsgRow}>
              <Ionicons name="information-circle-outline" size={15} color={COLORS.primary} />
              <Text style={styles.formMsg}>{formMessage}</Text>
            </View>
          ) : null}
          {searchError ? (
            <View style={styles.formMsgRow}>
              <Ionicons name="alert-circle-outline" size={15} color={COLORS.danger} />
              <Text style={[styles.formMsg, { color: COLORS.danger }]}>{searchError}</Text>
            </View>
          ) : null}
        </View>

        {/* ── SEARCH RESULTS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Available Buses</Text>
            {hasSearched && searchResults.length > 0 && (
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeText}>{searchResults.length} found</Text>
              </View>
            )}
          </View>

          {searchLoading ? (
            <View style={styles.emptyCard}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.emptyText}>Searching available trips…</Text>
            </View>
          ) : !hasSearched ? (
            <View style={styles.emptyCard}>
              <Ionicons name="bus-outline" size={32} color={COLORS.border} />
              <Text style={styles.emptyText}>Enter route and date to find buses.</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="search-outline" size={32} color={COLORS.border} />
              <Text style={styles.emptyText}>No buses found. Try a different date or route.</Text>
            </View>
          ) : (
            <View style={styles.tripList}>
              {searchResults.map((trip) => (
                <TripCard key={trip.schedule_id} trip={trip} onSelect={handleSelectTrip} />
              ))}
            </View>
          )}
        </View>

        {/* ── FEATURES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Why SafariTix</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </View>
        </View>

        {/* ── PHONE MOCKUPS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>See It In Action</Text>
          <View style={styles.mockupRow}>
            {PHONE_SCREENS.map((screen, i) => (
              <PhoneMockup
                key={i}
                phoneIndex={i}
                anim={{ translateY: floatAnims[i].interpolate({ inputRange: [0,1], outputRange: [0,-10] }) }}
                rotate={i === 0 ? '-7deg' : i === 2 ? '7deg' : '0deg'}
                scale={phoneScales[i]}
                content={screen}
              />
            ))}
          </View>
        </View>

        {/* ── TRUST SECTION ── */}
        <View style={[styles.trustSection, SHADOW.sm]}>
          <Text style={styles.trustHeading}>Trusted across Rwanda</Text>
          <Text style={styles.trustSub}>Commuters rely on us every day for safe, reliable travel.</Text>
          <View style={styles.trustGrid}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.trustStat}>
                <Text style={styles.trustStatValue}>{s.value}</Text>
                <Text style={styles.trustStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── FINAL CTA ── */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cta}
        >
          <View style={styles.ctaGlowCircle} />
          <Text style={styles.ctaTitle}>Your next journey{'\n'}starts here.</Text>
          <Text style={styles.ctaSub}>Join thousands of Rwandans booking smarter.</Text>
          <PrimaryButton label="Book Now" icon="arrow-forward" onPress={handleFindBus} variant="secondary" />
        </LinearGradient>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 SafariTix · Rwanda</Text>
        </View>
      </ScrollView>

      <SlideMenu
        mounted={isMenuMounted}
        slideAnim={menuSlideAnim}
        overlayAnim={menuOverlayAnim}
        onClose={closeMenu}
        onSelectItem={handleMenuSelect}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_PADDING = 18;
const COL_GAP = 12;
const CARD_W = (width - 36 - COL_GAP) / 2;

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: COLORS.background },
  scroll:    { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 36, gap: 24 },

  // ── Util ──
  pressed96: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  pressed97: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  menuButton: {
    width: 40, height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  iconButton: {
    width: 36, height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Hero ──
  hero: { gap: 14, paddingTop: 8 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  heroBadgeDot: {
    width: 7, height: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  heroTitle: {
    fontSize: 34, fontWeight: '900', color: COLORS.text, lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroSub: { fontSize: 15, color: COLORS.muted, lineHeight: 22 },
  heroStats: {
    flexDirection: 'row', gap: 0,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
    marginTop: 4,
  },
  heroStat: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderRightWidth: 1, borderColor: COLORS.border,
  },
  heroStatValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  heroStatLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', marginTop: 2 },

  // ── Booking Card ──
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: CARD_PADDING,
    gap: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  bookingCardHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 2,
  },
  cardHeading: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  cardBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  cardBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  // ── Input ──
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    minHeight: 52,
    borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
  },
  inputWrapFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  input: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 0 },

  // ── Date Pills ──
  quickDates: { flexDirection: 'row', gap: 8 },
  datePill: {
    borderWidth: 1, borderColor: COLORS.primaryMid,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  datePillPressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  datePillText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // ── Button ──
  btn: {
    minHeight: 54, borderRadius: RADIUS.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnPrimary:   { backgroundColor: COLORS.primary },
  btnSecondary: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.65)' },
  btnGhost:     { backgroundColor: 'transparent' },
  btnText:    { color: COLORS.white,   fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  btnTextAlt: { color: COLORS.primary, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },

  // ── Form messages ──
  formMsgRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formMsg:    { flex: 1, fontSize: 13, color: COLORS.muted, fontWeight: '600' },

  // ── Section ──
  section: { gap: 14 },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionHeading: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  resultBadge: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  resultBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.success },

  // ── Empty State ──
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 28,
    alignItems: 'center', gap: 10,
  },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', fontWeight: '500' },

  // ── Trip Card ──
  tripList: { gap: 12 },
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 14, gap: 10,
  },
  tripRouteRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tripRouteStop: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripDot: { width: 9, height: 9, borderRadius: RADIUS.full },
  tripStopText: { fontSize: 13, fontWeight: '700', color: COLORS.text, flex: 1 },
  tripArrowLine: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  tripLine: { width: 20, height: 1, backgroundColor: COLORS.border },
  tripMetaRow: { flexDirection: 'row', gap: 14 },
  tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripMetaText: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  tripBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  tripCompany: { fontSize: 12, color: COLORS.muted, fontWeight: '600', marginBottom: 2 },
  tripPrice: { fontSize: 17, fontWeight: '900', color: COLORS.primary },
  tripSelectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  tripSelectBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },

  // ── Features ──
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: COL_GAP },
  featureCard: {
    width: CARD_W,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 14, gap: 8,
  },
  featureIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  featureDesc:  { fontSize: 12, color: COLORS.muted, lineHeight: 17 },

  // ── Phone Mockups ──
  mockupRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  phoneShell: {
    width: Math.min(width * 0.26, 115),
    height: Math.min(width * 0.54, 240),
    borderRadius: 22,
    backgroundColor: '#0F172A',
    padding: 4,
  },
  phoneCenterShell: {
    width: Math.min(width * 0.30, 134),
    height: Math.min(width * 0.61, 268),
    zIndex: 2,
  },
  phoneScreen: { flex: 1, borderRadius: 18, overflow: 'hidden', backgroundColor: COLORS.surface },
  phoneNotch: {
    position: 'absolute', top: 0, alignSelf: 'center', zIndex: 10,
    width: 32, height: 5, borderRadius: 3, backgroundColor: '#0F172A', marginTop: 6,
  },
  phoneHeader: {
    paddingTop: 18, paddingBottom: 8, paddingHorizontal: 8,
  },
  phoneHeaderTitle: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  phoneBody: { flex: 1, padding: 7, gap: 5 },

  // Phone screen micro-components
  miniField: {
    minHeight: 22, borderRadius: 7, borderWidth: 1,
    borderColor: COLORS.primaryMid, backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  miniFieldText: { fontSize: 7, fontWeight: '600', color: COLORS.text },
  miniBtn: {
    marginTop: 2, backgroundColor: COLORS.accent, borderRadius: 7,
    minHeight: 20, alignItems: 'center', justifyContent: 'center',
  },
  miniBtnText: { color: COLORS.text, fontSize: 7, fontWeight: '800' },
  miniBusCard: {
    borderRadius: 7, borderWidth: 1,
    borderColor: COLORS.border, backgroundColor: COLORS.white,
    paddingHorizontal: 7, paddingVertical: 5, gap: 3,
  },
  miniBusName:  { fontSize: 7, fontWeight: '800', color: COLORS.text, flex: 1 },
  miniBusPrice: { fontSize: 7, fontWeight: '800', color: COLORS.primary },
  miniBusTime:  { fontSize: 7, fontWeight: '600', color: COLORS.muted },
  miniSeatBtn: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primary,
    borderRadius: 5, paddingHorizontal: 5, paddingVertical: 3,
  },
  miniSeatBtnText: { color: COLORS.white, fontSize: 7, fontWeight: '700' },
  miniTicket: {
    borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0',
    backgroundColor: COLORS.successLight, padding: 8, gap: 3,
  },
  miniTicketLabel: { fontSize: 6, color: COLORS.muted, fontWeight: '700', textTransform: 'uppercase' },
  miniTicketValue: { fontSize: 8, fontWeight: '800', color: COLORS.text },
  miniStatusPill: {
    marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-start', backgroundColor: '#DCFCE7',
    borderRadius: RADIUS.full, paddingHorizontal: 5, paddingVertical: 2,
  },
  miniStatusText: { fontSize: 7, color: COLORS.success, fontWeight: '800' },
  miniTicketNote: { marginTop: 2, fontSize: 7, color: '#166534', fontWeight: '600', lineHeight: 10 },

  // ── Trust ──
  trustSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    padding: CARD_PADDING,
    gap: 8,
    alignItems: 'center',
  },
  trustHeading: { fontSize: 18, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  trustSub:     { fontSize: 13, color: COLORS.muted, textAlign: 'center', lineHeight: 19 },
  trustGrid: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  trustStat: {
    flex: 1, backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 12, alignItems: 'center',
  },
  trustStatValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  trustStatLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', marginTop: 2 },

  // ── CTA ──
  cta: {
    borderRadius: RADIUS.xl,
    padding: CARD_PADDING + 4, gap: 10,
    overflow: 'hidden',
  },
  ctaGlowCircle: {
    position: 'absolute', right: -50, top: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  ctaTitle: { color: COLORS.white, fontSize: 26, fontWeight: '900', lineHeight: 32, letterSpacing: -0.3 },
  ctaSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 20, marginBottom: 4 },

  // ── Slide Menu ──
  menuOverlayContainer: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 100, flexDirection: 'row', justifyContent: 'flex-end',
  },
  menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.4)' },
  menuPanel: {
    width: Math.min(width * 0.76, 320),
    height: '100%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 14,
  },
  menuTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  menuList: { gap: 8 },
  menuItem: {
    minHeight: 52, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  menuItemPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  menuIconWrap: {
    width: 32, height: 32, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIconWrapPrimary: { backgroundColor: 'rgba(255,255,255,0.18)' },
  menuItemText:        { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1 },
  menuItemTextPrimary: { fontSize: 15, fontWeight: '800', color: COLORS.white, flex: 1 },
  menuFooter: { position: 'absolute', bottom: 28, left: 16, right: 16, alignItems: 'center' },
  menuFooterText: { fontSize: 11, color: COLORS.mutedLight, fontWeight: '500' },

  // ── Footer ──
  footer: { alignItems: 'center', paddingBottom: 8 },
  footerText: { fontSize: 12, color: COLORS.mutedLight, fontWeight: '500' },
});