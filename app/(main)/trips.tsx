import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { getMyTickets, CommuterTicket } from '@/services/tickets/ticketService';
import { Button, Card, EmptyState, Fact, RouteLine, Skeleton, StatusPill, TearLine, Tap } from '@/components/ui';
import { color, radius, space, statusMeta, type } from '@/theme';

type Tab = 'upcoming' | 'past';

function TicketCard({ t, onOpen, onTrack }: { t: CommuterTicket; onOpen: () => void; onTrack: () => void }) {
  const meta = statusMeta(t.status);
  return (
    <Card style={{ paddingBottom: space.lg }}>
      <View style={s.head}>
        <Text style={s.ref} numberOfLines={1}>{t.booking_ref ? `#${t.booking_ref}` : 'Booking'}</Text>
        <StatusPill status={t.status} />
      </View>

      <RouteLine from={t.from_stop || 'N/A'} to={t.to_stop || 'N/A'} />
      <TearLine />

      <View style={s.facts}>
        <Fact label="DATE" value={t.schedule_date || 'N/A'} />
        <Fact label="DEPARTS" value={t.departure_time || 'TBA'} />
        <Fact label="SEAT" value={String(t.seat_number || 'N/A')} align="right" />
      </View>
      <View style={[s.facts, { marginTop: space.md }]}>
        <Fact label="BUS" value={t.bus_plate || 'N/A'} />
        <Fact label="FARE" value={t.price == null ? 'N/A' : `RWF ${Number(t.price).toLocaleString()}`} align="right" />
      </View>

      <View style={s.actions}>
        <Button title="View ticket" icon="qr-code-outline" compact onPress={onOpen} style={{ flex: 1 }} />
        {meta.trackable ? <Button title="Track" icon="navigate" compact variant="soft" onPress={onTrack} style={{ flex: 1 }} /> : null}
      </View>
    </Card>
  );
}

export default function TripsScreen() {
  const router = useRouter();
  const [tickets, setTickets] = useState<CommuterTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('upcoming');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    try { setTickets(await getMyTickets()); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load your tickets.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const { upcoming, past } = useMemo(() => ({
    upcoming: tickets.filter((t) => !statusMeta(t.status).past),
    past: tickets.filter((t) => statusMeta(t.status).past),
  }), [tickets]);
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={color.brand} />}>
        <View>
          <Text style={s.kicker}>MY TICKETS</Text>
          <Text style={[type.h1, { color: color.ink }]}>Your trips</Text>
        </View>

        <View style={s.seg} accessibilityRole="tablist">
          {(['upcoming', 'past'] as Tab[]).map((k) => {
            const on = tab === k; const n = k === 'upcoming' ? upcoming.length : past.length;
            return (
              <Tap key={k} role="tab" label={k} onPress={() => setTab(k)} style={[s.segItem, on && s.segOn]}>
                <Text style={[s.segText, on && { color: color.ink }]}>{k === 'upcoming' ? 'Upcoming' : 'Past'}{n ? `  ${n}` : ''}</Text>
              </Tap>
            );
          })}
        </View>

        {loading ? (
          <><Skeleton height={260} /><Skeleton height={260} /></>
        ) : error ? (
          <Card><EmptyState icon="cloud-offline-outline" title="Couldn't load tickets" text={error} actionLabel="Try again" onAction={() => load()} /></Card>
        ) : list.length === 0 ? (
          <Card>
            <EmptyState
              icon={tab === 'upcoming' ? 'ticket-outline' : 'time-outline'}
              title={tab === 'upcoming' ? 'No upcoming trips' : 'No past trips yet'}
              text={tab === 'upcoming' ? 'Search for a bus on Home and your ticket will appear here.' : 'Completed and cancelled trips will show up here.'}
              actionLabel={tab === 'upcoming' ? 'Find a bus' : undefined}
              onAction={() => router.navigate('/')}
            />
          </Card>
        ) : (
          list.map((t) => (
            <TicketCard key={String(t.id)} t={t}
              onOpen={() => router.push({ pathname: '/tickets/[id]', params: { id: String(t.id) } })}
              onTrack={() => router.push({ pathname: '/track', params: { bookingId: String(t.id) } })} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { padding: space.xl, paddingBottom: space.xxxl + 20, gap: space.lg },
  kicker: { ...type.micro, color: color.brand, marginBottom: 4 },
  seg: { flexDirection: 'row', backgroundColor: color.lineSoft, borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  segOn: { backgroundColor: color.white },
  segText: { fontSize: 14, fontWeight: '800', color: color.muted },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg },
  ref: { ...type.micro, color: color.muted, flex: 1, marginRight: space.sm },
  facts: { flexDirection: 'row', gap: space.md },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
});
