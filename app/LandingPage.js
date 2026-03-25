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
const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#0077B6',
  secondary: '#F4A261',
  success: '#27AE60',
  background: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  surface: '#F8FAFC',
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://backend-7cxc.onrender.com/api';

const MENU_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'search', label: 'Search Bus', icon: 'search', primary: true },
  { key: 'tickets', label: 'My Tickets', icon: 'ticket-outline' },
  { key: 'track', label: 'Track Bus', icon: 'navigate-outline' },
  { key: 'contact', label: 'Contact Us', icon: 'call-outline' },
];

function Header({ onMenuPress }) {
  return (
    <View style={styles.header}>
      <View style={styles.logoWrap}>
        <View style={styles.logoBadge}>
          <Ionicons name="bus" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.logoText}>SafariTix</Text>
      </View>
      <Pressable
        onPress={onMenuPress}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
      >
        <Ionicons name="menu" size={20} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

function SlideMenu({ mounted, slideAnim, overlayAnim, onClose, onSelectItem }) {
  if (!mounted) return null;

  return (
    <View style={styles.menuOverlayContainer} pointerEvents="box-none">
      <Animated.View style={[styles.menuBackdrop, { opacity: overlayAnim }]}>
        <Pressable style={styles.menuBackdropPressArea} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.menuPanel,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.menuTopRow}>
          <Text style={styles.menuTitle}>Menu</Text>
          <Pressable onPress={onClose} style={({ pressed }) => [styles.menuCloseButton, pressed && styles.menuCloseButtonPressed]}>
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
                pressed && styles.menuItemPressed,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={item.primary ? '#FFFFFF' : COLORS.primary}
              />
              <Text style={item.primary ? styles.menuItemPrimaryText : styles.menuItemText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

function ScaleButton({ label, onPress, variant = 'primary', icon }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue) => {
    Animated.spring(scale, {
      toValue,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => animate(0.97)}
      onPressOut={() => animate(1)}
      onPress={onPress}
      style={{ width: '100%' }}
    >
      <Animated.View
        style={[
          styles.button,
          variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={variant === 'primary' ? styles.buttonPrimaryText : styles.buttonSecondaryText}>
          {label}
        </Text>
        {icon ? <Ionicons name={icon} size={18} color={variant === 'primary' ? '#FFFFFF' : COLORS.primary} /> : null}
      </Animated.View>
    </Pressable>
  );
}

export default function LandingPage() {
  const router = useRouter();

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
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

  const menuWidth = Math.min(width * 0.76, 320);
  const menuSlideAnim = useRef(new Animated.Value(menuWidth)).current;
  const menuOverlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = floatAnims.map((anim, idx) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 180),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return loop;
    });

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [floatAnims]);

  const animatePhonePress = (index, pressed) => {
    Animated.spring(phoneScales[index], {
      toValue: pressed ? 1.05 : 1,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const getPhoneStyle = (index, rotate = '0deg') => {
    const translateY = floatAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -12],
    });

    return {
      transform: [{ translateY }, { scale: phoneScales[index] }, { rotate }],
    };
  };

  const setQuickDate = (mode) => {
    const now = new Date();

    if (mode === 'today') {
      setTravelDate(now.toISOString().slice(0, 10));
      return;
    }

    if (mode === 'tomorrow') {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setTravelDate(tomorrow.toISOString().slice(0, 10));
      return;
    }

    const weekend = new Date(now);
    const day = weekend.getDay();
    const addDays = day === 6 ? 0 : day === 0 ? 6 : 6 - day;
    weekend.setDate(weekend.getDate() + addDays);
    setTravelDate(weekend.toISOString().slice(0, 10));
  };

  const normalizeTrip = (trip) => ({
    schedule_id: String(trip.schedule_id || trip.scheduleId || trip.id || ''),
    route_id: trip.route_id || trip.routeId || '',
    bus_id: trip.bus_id || trip.busId || '',
    bus_plate: trip.bus_plate || trip.plate_number || trip.busPlate || '',
    company_name: trip.company_name || trip.companyName || 'SafariTix operator',
    pickup_stop: trip.pickup_stop || trip.from_stop || trip.from || fromLocation,
    dropoff_stop: trip.dropoff_stop || trip.to_stop || trip.to || toLocation,
    departure_date: trip.departure_date || trip.date || null,
    departure_time: trip.departure_time || trip.time || null,
    available_seats: Number(trip.available_seats ?? trip.seatsAvailable ?? trip.availableSeats ?? 0),
    price: Number(trip.price ?? 0),
  });

  const handleFindBus = async () => {
    if (!fromLocation.trim() || !toLocation.trim() || !travelDate.trim()) {
      setFormMessage('Please fill From, To, and Date to search buses.');
      return;
    }

    if (fromLocation.trim().toLowerCase() === toLocation.trim().toLowerCase()) {
      setFormMessage('From and To cannot be the same.');
      return;
    }

    setFormMessage('Searching available buses...');
    setSearchError('');
    setHasSearched(true);
    setSearchLoading(true);

    try {
      const query = new URLSearchParams({
        from: fromLocation.trim(),
        to: toLocation.trim(),
        date: travelDate.trim(),
      });

      const response = await fetch(`${API_BASE_URL}/search-trips?${query.toString()}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'Unable to search buses right now.');
      }

      const trips = Array.isArray(payload?.trips) ? payload.trips : [];
      const normalized = trips.map(normalizeTrip).filter((trip) => Boolean(trip.schedule_id));
      setSearchResults(normalized);

      if (normalized.length === 0) {
        setFormMessage('No buses found for this route/date. Try another date or route.');
      } else {
        setFormMessage(`Found ${normalized.length} bus${normalized.length > 1 ? 'es' : ''}.`);
      }
    } catch (error) {
      setSearchResults([]);
      setSearchError(error?.message || 'Network error while searching buses.');
      setFormMessage('');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectTrip = (trip) => {
    router.push({
      pathname: '/seat-map',
      params: {
        scheduleId: trip.schedule_id,
        busId: trip.bus_id || '',
        busPlate: trip.bus_plate || '',
        from: trip.pickup_stop || fromLocation,
        to: trip.dropoff_stop || toLocation,
        departureDate: trip.departure_date || '',
        departureTime: trip.departure_time || '',
        routeId: trip.route_id || '',
        price: String(trip.price || 0),
      },
    });
  };

  const openMenu = () => {
    setIsMenuMounted(true);
    Animated.parallel([
      Animated.timing(menuSlideAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(menuOverlayAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(menuSlideAnim, {
        toValue: menuWidth,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(menuOverlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuMounted(false);
    });
  };

  const handleMenuSelect = (item) => {
    closeMenu();
    if (item.key === 'search') {
      handleFindBus();
      return;
    }

    if (item.key === 'home') {
      router.push('/LandingPage');
      return;
    }

    router.push('/(tabs)');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. HEADER */}
        <Header onMenuPress={openMenu} />

        {/* 2. HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Book Bus Tickets Instantly</Text>
          <Text style={styles.heroSubtitle}>Fast, reliable, and secure travel across Rwanda</Text>
          <ScaleButton label="Find Bus" icon="search" onPress={handleFindBus} />
        </View>

        {/* 3. QUICK BOOKING FORM */}
        <View style={styles.bookingCard}>
          <Text style={styles.sectionHeading}>Quick Booking</Text>
          <TextInput
            value={fromLocation}
            onChangeText={setFromLocation}
            placeholder="From (location)"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <TextInput
            value={toLocation}
            onChangeText={setToLocation}
            placeholder="To (destination)"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <TextInput
            value={travelDate}
            onChangeText={setTravelDate}
            placeholder="Date (YYYY-MM-DD)"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <View style={styles.quickDateRow}>
            <Pressable onPress={() => setQuickDate('today')} style={styles.quickDateChip}>
              <Text style={styles.quickDateText}>Today</Text>
            </Pressable>
            <Pressable onPress={() => setQuickDate('tomorrow')} style={styles.quickDateChip}>
              <Text style={styles.quickDateText}>Tomorrow</Text>
            </Pressable>
            <Pressable onPress={() => setQuickDate('weekend')} style={styles.quickDateChip}>
              <Text style={styles.quickDateText}>Weekend</Text>
            </Pressable>
          </View>

          <ScaleButton label="Search Buses" icon="arrow-forward" onPress={handleFindBus} />
          {formMessage ? <Text style={styles.formMessage}>{formMessage}</Text> : null}
          {searchError ? <Text style={styles.formError}>{searchError}</Text> : null}
        </View>

        {/* Search Results (mobile equivalent of web search list) */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionHeading}>Available Buses</Text>

          {searchLoading ? (
            <View style={styles.resultsLoadingBox}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.resultsLoadingText}>Searching trips...</Text>
            </View>
          ) : !hasSearched ? (
            <View style={styles.resultsEmptyBox}>
              <Text style={styles.resultsEmptyText}>Search by route and date to see available buses.</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.resultsEmptyBox}>
              <Text style={styles.resultsEmptyText}>No buses found for your selected route/date.</Text>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {searchResults.map((trip) => (
                <View key={trip.schedule_id} style={styles.resultCard}>
                  <View style={styles.resultHeaderRow}>
                    <Text style={styles.resultRouteText}>{trip.pickup_stop}{' -> '}{trip.dropoff_stop}</Text>
                    <Text style={styles.resultPriceText}>RWF {trip.price.toLocaleString()}</Text>
                  </View>
                  <Text style={styles.resultMetaText}>Bus: {trip.bus_plate || 'TBA'} • {trip.company_name}</Text>
                  <Text style={styles.resultMetaText}>Departure: {trip.departure_time || 'TBA'} • {trip.departure_date || 'Date TBA'}</Text>
                  <Text style={styles.resultMetaText}>Seats available: {trip.available_seats}</Text>

                  <Pressable
                    onPress={() => handleSelectTrip(trip)}
                    style={({ pressed }) => [styles.selectTripBtn, pressed && styles.selectTripBtnPressed]}
                  >
                    <Text style={styles.selectTripBtnText}>Select Seat</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 4. FEATURES SECTION */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionHeading}>Why SafariTix</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="ticket" size={20} color={COLORS.primary} />
              <Text style={styles.featureTitle}>Easy Booking</Text>
              <Text style={styles.featureDesc}>Book in seconds with a simple flow.</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="location" size={20} color={COLORS.primary} />
              <Text style={styles.featureTitle}>Real-time Bus Tracking</Text>
              <Text style={styles.featureDesc}>See live movement and arrival updates.</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="close-circle" size={20} color={COLORS.primary} />
              <Text style={styles.featureTitle}>Ticket Cancellation</Text>
              <Text style={styles.featureDesc}>Manage and cancel eligible trips fast.</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              <Text style={styles.featureTitle}>Secure Payments</Text>
              <Text style={styles.featureDesc}>Protected checkout with trusted methods.</Text>
            </View>
          </View>
        </View>

        {/* 5. PHONE MOCKUP SHOWCASE */}
        <View style={styles.mockupSection}>
          <Text style={styles.sectionHeading}>See It In Action</Text>
          <View style={styles.mockupRow}>
            <Pressable
              onPressIn={() => animatePhonePress(0, true)}
              onPressOut={() => animatePhonePress(0, false)}
            >
              <Animated.View style={[styles.phoneShell, styles.phoneLeft, getPhoneStyle(0, '-8deg')]}> 
                <View style={styles.phoneScreen}>
                  {/* Phone 1: Search Bus screen */}
                  <View style={styles.phoneHeader}>
                    <Text style={styles.phoneHeaderTitle}>Search Bus</Text>
                  </View>
                  <View style={styles.phoneBody}>
                    <View style={styles.miniInput}>
                      <Ionicons name="locate" size={10} color={COLORS.primary} />
                      <Text style={styles.miniInputText}>From: Kigali</Text>
                    </View>
                    <View style={styles.miniInput}>
                      <Ionicons name="navigate" size={10} color={COLORS.primary} />
                      <Text style={styles.miniInputText}>To: Butare</Text>
                    </View>
                    <View style={styles.miniInput}>
                      <Ionicons name="calendar" size={10} color={COLORS.primary} />
                      <Text style={styles.miniInputText}>Date: 2026-03-25</Text>
                    </View>
                    <View style={styles.miniPrimaryBtn}>
                      <Text style={styles.miniPrimaryBtnText}>Search</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </Pressable>

            <Pressable
              onPressIn={() => animatePhonePress(1, true)}
              onPressOut={() => animatePhonePress(1, false)}
            >
              <Animated.View style={[styles.phoneShell, styles.phoneCenter, getPhoneStyle(1)]}> 
                <View style={styles.phoneScreen}>
                  {/* Phone 2: Bus results / seat selection */}
                  <View style={styles.phoneHeader}>
                    <Text style={styles.phoneHeaderTitle}>Bus Results</Text>
                  </View>
                  <View style={styles.phoneBody}>
                    <View style={styles.busCardMini}>
                      <View style={styles.busRowMini}>
                        <Text style={styles.busNameMini}>Volcano A34</Text>
                        <Text style={styles.busPriceMini}>RWF 3,500</Text>
                      </View>
                      <Text style={styles.busTimeMini}>10:00 AM</Text>
                      <View style={styles.seatBtnMini}>
                        <Text style={styles.seatBtnMiniText}>Select Seat</Text>
                      </View>
                    </View>

                    <View style={styles.busCardMini}>
                      <View style={styles.busRowMini}>
                        <Text style={styles.busNameMini}>Ritco B12</Text>
                        <Text style={styles.busPriceMini}>RWF 4,000</Text>
                      </View>
                      <Text style={styles.busTimeMini}>11:30 AM</Text>
                      <View style={styles.seatBtnMini}>
                        <Text style={styles.seatBtnMiniText}>Select Seat</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </Pressable>

            <Pressable
              onPressIn={() => animatePhonePress(2, true)}
              onPressOut={() => animatePhonePress(2, false)}
            >
              <Animated.View style={[styles.phoneShell, styles.phoneRight, getPhoneStyle(2, '8deg')]}> 
                <View style={styles.phoneScreen}>
                  {/* Phone 3: Ticket confirmation */}
                  <View style={styles.phoneHeader}>
                    <Text style={styles.phoneHeaderTitle}>Ticket</Text>
                  </View>
                  <View style={styles.phoneBody}>
                    <View style={styles.confirmCardMini}>
                      <Text style={styles.confirmLabelMini}>Route</Text>
                      <Text style={styles.confirmValueMini}>Kigali → Butare</Text>

                      <Text style={styles.confirmLabelMini}>Seat</Text>
                      <Text style={styles.confirmValueMini}>B12</Text>

                      <View style={styles.statusPillMini}>
                        <Ionicons name="checkmark-circle" size={10} color={COLORS.success} />
                        <Text style={styles.statusPillTextMini}>Confirmed</Text>
                      </View>

                      <Text style={styles.successMessageMini}>
                        Your ticket is ready. Show this at boarding.
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* 6. TRUST / SOCIAL PROOF */}
        <View style={styles.trustSection}>
          <Text style={styles.trustTitle}>Trusted by commuters across Rwanda</Text>
          <View style={styles.trustStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Tickets booked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>120+</Text>
              <Text style={styles.statLabel}>Routes covered</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>User rating</Text>
            </View>
          </View>
        </View>

        {/* 7. FINAL CALL TO ACTION */}
        <LinearGradient colors={[COLORS.primary, '#005E90']} style={styles.finalCta}>
          <Text style={styles.finalCtaTitle}>Start your journey with SafariTix today</Text>
          <ScaleButton label="Book Now" icon="arrow-forward" onPress={handleFindBus} variant="secondary" />
        </LinearGradient>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 18,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  menuButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },

  // Slide menu
  menuOverlayContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  menuBackdropPressArea: {
    flex: 1,
  },
  menuPanel: {
    width: Math.min(width * 0.76, 320),
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 42,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  menuTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  menuCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  menuCloseButtonPressed: {
    opacity: 0.72,
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE5F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuItemPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  menuItemPressed: {
    transform: [{ scale: 0.98 }],
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  menuItemPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Hero
  heroSection: {
    backgroundColor: '#F8FCFF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: 6,
  },

  // Buttons
  button: {
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  // Booking Form
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  quickDateChip: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  quickDateText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  formMessage: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  formError: {
    color: '#B42318',
    fontSize: 12,
    marginTop: 2,
  },

  resultsSection: {
    gap: 10,
  },
  resultsLoadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  resultsLoadingText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
  },
  resultsEmptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  resultsEmptyText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  resultsList: {
    gap: 10,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 5,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  resultRouteText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '800',
    flex: 1,
  },
  resultPriceText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
  },
  resultMetaText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  selectTripBtn: {
    marginTop: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectTripBtnPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  selectTripBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Features
  featuresSection: {
    gap: 10,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureCard: {
    width: (width - 46) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 6,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 16,
  },

  // Mockups
  mockupSection: {
    gap: 10,
  },
  mockupRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  phoneShell: {
    width: Math.min(width * 0.27, 122),
    height: Math.min(width * 0.56, 248),
    borderRadius: 24,
    backgroundColor: '#0F172A',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 8,
  },
  phoneLeft: {
    marginRight: -4,
  },
  phoneCenter: {
    width: Math.min(width * 0.31, 138),
    height: Math.min(width * 0.63, 278),
    zIndex: 2,
  },
  phoneRight: {
    marginLeft: -4,
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },

  phoneHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },

  phoneHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  phoneBody: {
    flex: 1,
    padding: 8,
    gap: 6,
  },

  miniInput: {
    minHeight: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  miniInputText: {
    color: '#1E293B',
    fontSize: 7,
    fontWeight: '600',
  },

  miniPrimaryBtn: {
    marginTop: 2,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  miniPrimaryBtnText: {
    color: '#1F2937',
    fontSize: 8,
    fontWeight: '800',
  },

  busCardMini: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },

  busRowMini: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },

  busNameMini: {
    fontSize: 7,
    color: '#0F172A',
    fontWeight: '800',
    flex: 1,
  },

  busPriceMini: {
    fontSize: 7,
    color: COLORS.primary,
    fontWeight: '800',
  },

  busTimeMini: {
    fontSize: 7,
    color: COLORS.muted,
    fontWeight: '600',
  },

  seatBtnMini: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  seatBtnMiniText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '700',
  },

  confirmCardMini: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    padding: 8,
    gap: 4,
  },

  confirmLabelMini: {
    fontSize: 6,
    color: COLORS.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  confirmValueMini: {
    fontSize: 8,
    color: '#0F172A',
    fontWeight: '800',
  },

  statusPillMini: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  statusPillTextMini: {
    fontSize: 7,
    color: COLORS.success,
    fontWeight: '800',
  },

  successMessageMini: {
    marginTop: 2,
    fontSize: 7,
    color: '#166534',
    lineHeight: 10,
    fontWeight: '600',
  },

  // Trust
  trustSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  trustTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  trustStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
    marginTop: 2,
  },

  // Final CTA
  finalCta: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  finalCtaTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
});
