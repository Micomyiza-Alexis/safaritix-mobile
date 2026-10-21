import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, ApiError } from '@/services/api/client';
import { getMyTickets, CommuterTicket } from '@/services/tickets/ticketService';
import { getAccessToken } from '@/services/auth/authService';
import { useAuthStore } from '@/stores/authStore';
import TrackBusMap from '@/components/TrackBusMap';
import { Card, Chip, EmptyState, Pill, RouteLine, StatusPill, Button } from '@/components/ui';
import { color, elevation, radius, space, statusMeta, type } from '@/theme';
import { SOCKET_ORIGIN } from '@/config/api';

type TrackingResponse = {
  trackingAvailable?: boolean; booking?: any;
  location?: { latitude: number; longitude: number; speed?: number | null; timestamp?: string; currentLocationLabel?: string };
  calculations?: { etaMinutes?: number | null; distanceRemainingKm?: number | null };
};
type SocketLocation = {
  scheduleId?: string | number;
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  timestamp?: string;
};
const STALE_MS = 120000;

function Metric({ icon, label, value, big }: { icon: any; label: string; value: string; big?: boolean }) {
  return (
    <View style={s.metric}>
      <Ionicons name={icon} size={16} color={color.brand} />
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={[s.metricValue, big && { fontSize: 22 }, type.num]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function TrackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const { isInitialized, isAuthenticated, refresh } = useAuthStore();
  const [tickets, setTickets] = useState<CommuterTicket[]>([]);
  const [selected, setSelected] = useState<string | null>(params.bookingId || null);
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      const result = await getMyTickets();
      setTickets(result);
      if (!selected) {
        const first = result.find((t) => statusMeta(t.status).trackable);
        if (first) setSelected(String(first.id));
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load your trips.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, [selected]);
  useFocusEffect(useCallback(() => { loadTickets(); }, [loadTickets]));

  const ticket = tickets.find((t) => String(t.id) === selected);

  const loadTracking = useCallback(async () => {
    if (!selected || !isInitialized || !isAuthenticated) return;
    const expire = () => { setError('Your session has expired. Please sign in again.'); router.replace('/auth/login'); };
    try {
      setError('');
      let token = await getAccessToken();
      if (!token) return expire();
      const url = `/tracking/booking/${encodeURIComponent(selected)}/location`;
      try {
        setData(await api.get<TrackingResponse>(url, { token })); setNow(Date.now());
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 401) throw err;
        const user = await refresh();
        if (!user) return expire();
        token = await getAccessToken();
        if (!token) return expire();
        setData(await api.get<TrackingResponse>(url, { token })); setNow(Date.now());
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load tracking.'); }
  }, [isAuthenticated, isInitialized, refresh, router, selected]);

  useEffect(() => {
    if (!selected || !isInitialized || !isAuthenticated) return;
    const initial = setTimeout(loadTracking, 0);
    const timer = setInterval(loadTracking, 5000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [isAuthenticated, isInitialized, loadTracking, selected]);

  // Reuse the backend's authenticated passenger room. Polling remains active
  // as a fallback for initial state and transient socket disconnects.
  useEffect(() => {
    const scheduleId = ticket?.schedule_id;
    if (!selected || !scheduleId || !isInitialized || !isAuthenticated || !statusMeta(ticket?.status).trackable) {
      return;
    }

    let cancelled = false;
    let socket: ReturnType<typeof io> | null = null;

    const connect = async () => {
      const token = await getAccessToken();
      if (!token || cancelled) return;

      socket = io(SOCKET_ORIGIN, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        auth: { token },
      });

      const applySocketLocation = (incoming: SocketLocation) => {
        if (cancelled || String(incoming.scheduleId || scheduleId) !== String(scheduleId)) return;
        const location = {
          latitude: Number(incoming.latitude),
          longitude: Number(incoming.longitude),
          speed: incoming.speed == null ? null : Number(incoming.speed),
          timestamp: incoming.timestamp || new Date().toISOString(),
          currentLocationLabel: 'Latest live position',
        };
        setData((previous) => ({
          ...(previous || {}),
          trackingAvailable: true,
          booking: previous?.booking || { id: selected, scheduleId },
          location,
        }));
        setNow(Date.now());
      };

      socket.on('connect', () => {
        socket?.emit('passenger:joinSchedule', {
          scheduleId: String(scheduleId),
          ticketId: String(ticket.id),
        });
      });
      socket.on('bus:currentLocation', applySocketLocation);
      socket.on('bus:locationUpdate', applySocketLocation);
      socket.on('connect_error', () => {
        // Polling continues to provide honest fallback data.
      });
    };

    void connect();
    return () => {
      cancelled = true;
      socket?.removeAllListeners();
      socket?.disconnect();
      socket = null;
    };
  }, [isAuthenticated, isInitialized, selected, ticket?.id, ticket?.schedule_id, ticket?.status]);

  const location = data?.location;
  const timestamp = location?.timestamp ? new Date(location.timestamp) : null;
  const stale = !timestamp || now - timestamp.getTime() > STALE_MS;
  const lastKnownCoordinates = location && Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude))
    ? { latitude: Number(location.latitude), longitude: Number(location.longitude) }
    : null;
  const coordinates = lastKnownCoordinates && !stale ? lastKnownCoordinates : null;
  const region = lastKnownCoordinates ? { ...lastKnownCoordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 } : undefined;
  const trackable = !!ticket && statusMeta(ticket.status).trackable;
  const live = !!coordinates && data?.trackingAvailable !== false;

  const eta = data?.calculations?.etaMinutes;
  const dist = data?.calculations?.distanceRemainingKm;
  const fmtEta = eta == null ? '—' : Math.max(0, Math.round(eta)) < 60 ? `${Math.max(0, Math.round(eta))} min` : `${Math.floor(Math.round(eta) / 60)}h ${Math.round(eta) % 60}m`;

  if (loading) return <View style={s.center}><ActivityIndicator color={color.brand} /></View>;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTickets(); }} tintColor={color.brand} />}>
        <View style={s.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>LIVE TRACKING</Text>
            <Text style={[type.h1, { color: color.ink }]}>Where&apos;s my bus?</Text>
          </View>
          {trackable ? <Pill text={live ? 'Live' : 'Offline'} tone={live ? 'ok' : 'warn'} icon={live ? 'radio' : 'cloud-offline'} /> : null}
        </View>

        {error ? (
          <View style={s.alert}>
            <Ionicons name="alert-circle" size={20} color={color.bad} />
            <Text style={s.alertText}>{error}</Text>
            <Pressable onPress={loadTracking} hitSlop={10}><Text style={s.retry}>Retry</Text></Pressable>
          </View>
        ) : null}

        {tickets.length === 0 ? (
          <Card><EmptyState icon="ticket-outline" title="No trips to track" text="Book a trip first, then come back once it's confirmed." actionLabel="Find a bus" onAction={() => router.navigate('/')} /></Card>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
              {tickets.map((t) => {
                const ok = statusMeta(t.status).trackable;
                return (
                  <View key={String(t.id)} style={!ok && { opacity: 0.45 }}>
                    <Chip label={`${t.from_stop || 'Origin'} → ${t.to_stop || 'Dest.'}`} sub={`${t.departure_time || 'TBA'} · ${statusMeta(t.status).label}`}
                      selected={String(t.id) === selected} onPress={() => ok && setSelected(String(t.id))} />
                  </View>
                );
              })}
            </ScrollView>

            {!trackable ? (
              <Card><EmptyState icon="lock-closed-outline" title="Choose a confirmed trip" text="Live tracking is available once your booking is confirmed." /></Card>
            ) : (
              <>
                {/* Map hero */}
                {lastKnownCoordinates ? (
                  <View style={[s.mapFrame, elevation.float]}>
                    <TrackBusMap loading={false} coordinates={lastKnownCoordinates} region={region} busPlate={data?.booking?.busPlate || ''} locationLabel={live ? (location?.currentLocationLabel || 'Latest live position') : 'Last known position'} />
                    {!live ? (
                      <View pointerEvents="none" style={s.staleOverlay}>
                        <Ionicons name="time-outline" size={15} color={color.ink} />
                        <Text style={s.staleOverlayText}>Last known location · GPS update is stale</Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <Card style={s.unavailable}>
                    <View style={s.unIcon}><Ionicons name={stale && timestamp ? 'time-outline' : 'locate-outline'} size={28} color={color.warn} /></View>
                    <Text style={s.unTitle}>{stale && timestamp ? 'Signal lost' : 'Waiting for the bus'}</Text>
                    <Text style={s.unText}>{stale && timestamp ? "The last GPS update is unavailable. We'll reconnect automatically." : "The driver hasn't started sharing location yet. This updates itself."}</Text>
                  </Card>
                )}

                {/* ETA metrics */}
                <Card style={s.metrics}>
                  <Metric icon="time" label="ETA" value={fmtEta} big />
                  <View style={s.vr} />
                  <Metric icon="trail-sign" label="Distance" value={dist == null ? '—' : `${Number(dist).toFixed(1)} km`} />
                  <View style={s.vr} />
                  <Metric icon="refresh" label="Updated" value={timestamp && !stale ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} />
                </Card>

                {/* Trip summary */}
                <Card style={{ gap: space.lg }}>
                  <View style={s.sumHead}>
                    <Text style={s.sumTitle}>Your trip</Text>
                    <StatusPill status={data?.booking?.status || ticket!.status} />
                  </View>
                  <RouteLine from={data?.booking?.from || ticket!.from_stop || 'Origin'} to={data?.booking?.to || ticket!.to_stop || 'Destination'} />
                  <View style={s.sumFacts}>
                    <View style={s.sumFact}><Text style={s.fl}>BUS</Text><Text style={s.fv}>{data?.booking?.busPlate || ticket!.bus_plate || 'TBA'}</Text></View>
                    <View style={s.sumFact}><Text style={s.fl}>SEAT</Text><Text style={s.fv}>{data?.booking?.seat || ticket!.seat_number || 'TBA'}</Text></View>
                    <View style={s.sumFact}><Text style={s.fl}>DEPARTS</Text><Text style={s.fv}>{ticket!.departure_time || 'TBA'}</Text></View>
                  </View>
                  <Button title="View ticket" icon="qr-code-outline" variant="soft" compact
                    onPress={() => router.push({ pathname: '/tickets/[id]', params: { id: String(ticket!.id) } })} />
                </Card>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg },
  content: { padding: space.xl, paddingBottom: space.xxxl + 20, gap: space.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  kicker: { ...type.micro, color: color.brand, marginBottom: 4 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: color.badSoft, borderRadius: radius.md, padding: space.md },
  alertText: { flex: 1, color: color.bad, fontSize: 13, fontWeight: '600' },
  retry: { color: color.brand, fontWeight: '800' },
  mapFrame: { height: 380, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: color.brandSoft, borderWidth: 1, borderColor: color.line },
  staleOverlay: { position: 'absolute', left: space.md, right: space.md, bottom: space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, paddingVertical: space.sm, paddingHorizontal: space.md, borderRadius: radius.md, backgroundColor: 'rgba(255, 248, 225, 0.96)', borderWidth: 1, borderColor: '#F3E2B3' },
  staleOverlayText: { color: color.ink, fontSize: 12, fontWeight: '700' },
  unavailable: { alignItems: 'center', paddingVertical: space.xxl, gap: 6, backgroundColor: color.warnSoft, borderColor: '#F3E2B3' },
  unIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  unTitle: { fontSize: 17, fontWeight: '800', color: color.ink },
  unText: { fontSize: 13, lineHeight: 19, color: color.sub, textAlign: 'center', maxWidth: 290 },
  metrics: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: space.lg },
  metric: { flex: 1, alignItems: 'center', gap: 3 },
  metricLabel: { ...type.micro, color: color.muted, fontSize: 10 },
  metricValue: { fontSize: 17, fontWeight: '800', color: color.ink },
  vr: { width: 1, backgroundColor: color.lineSoft },
  sumHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sumTitle: { ...type.h2, color: color.ink },
  sumFacts: { flexDirection: 'row', gap: space.md },
  sumFact: { flex: 1 },
  fl: { ...type.micro, color: color.muted, fontSize: 10 },
  fv: { fontSize: 15, fontWeight: '800', color: color.ink, marginTop: 3 },
});
