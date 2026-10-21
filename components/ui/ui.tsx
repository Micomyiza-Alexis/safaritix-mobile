// components/ui.tsx — shared primitives used by every screen
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, elevation, hit, radius, space, statusMeta, Tone, toneStyle, type } from '@/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/* ── Pressable with spring feedback ───────────────────────────── */
export function Tap({
  children, onPress, style, disabled, label, role = 'button',
}: {
  children: React.ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle>;
  disabled?: boolean; label?: string; role?: 'button' | 'tab' | 'link';
}) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(s, { toValue: v, friction: 8, tension: 160, useNativeDriver: true }).start();
  return (
    <Pressable
      onPress={onPress} disabled={disabled}
      onPressIn={() => to(0.97)} onPressOut={() => to(1)}
      accessibilityRole={role} accessibilityLabel={label} accessibilityState={{ disabled }}
    >
      <Animated.View style={[style, { transform: [{ scale: s }] }, disabled && { opacity: 0.5 }]}>{children}</Animated.View>
    </Pressable>
  );
}

/* ── Button ───────────────────────────────────────────────────── */
export function Button({
  title, onPress, icon, variant = 'primary', loading, disabled, compact, style,
}: {
  title: string; onPress?: () => void; icon?: IconName; variant?: 'primary' | 'soft' | 'ghost' | 'sun';
  loading?: boolean; disabled?: boolean; compact?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const v = {
    primary: { bg: color.brand, fg: color.white, extra: elevation.brand },
    sun: { bg: color.sun, fg: color.ink, extra: {} },
    soft: { bg: color.brandSoft, fg: color.brand, extra: {} },
    ghost: { bg: 'transparent', fg: color.brand, extra: {} },
  }[variant];
  return (
    <Tap onPress={onPress} disabled={disabled || loading} label={title}
      style={[s.btn, compact && s.btnCompact, { backgroundColor: v.bg }, v.extra as ViewStyle, style]}>
      <Text style={[s.btnText, { color: v.fg }]}>{loading ? 'Please wait…' : title}</Text>
      {icon && !loading ? <Ionicons name={icon} size={18} color={v.fg} /> : null}
    </Tap>
  );
}

/* ── Status pill ──────────────────────────────────────────────── */
export function Pill({ text, tone = 'neutral', icon }: { text: string; tone?: Tone; icon?: IconName }) {
  const t = toneStyle[tone];
  return (
    <View style={[s.pill, { backgroundColor: t.bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={t.fg} /> : null}
      <Text style={[s.pillText, { color: t.fg }]}>{text}</Text>
    </View>
  );
}
export const StatusPill = ({ status }: { status?: string | null }) => {
  const m = statusMeta(status);
  return <Pill text={m.label} tone={m.tone} />;
};

/* ── Selectable chip ──────────────────────────────────────────── */
export function Chip({ label, sub, selected, onPress }: { label: string; sub?: string; selected?: boolean; onPress: () => void }) {
  return (
    <Tap onPress={onPress} label={label} role="tab"
      style={[s.chip, selected && { backgroundColor: color.brand, borderColor: color.brand }]}>
      <Text style={[s.chipLabel, selected && { color: color.white }]}>{label}</Text>
      {sub ? <Text style={[s.chipSub, selected && { color: 'rgba(255,255,255,.8)' }]}>{sub}</Text> : null}
    </Tap>
  );
}

/* ── Card ─────────────────────────────────────────────────────── */
export const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[s.card, elevation.card, style]}>{children}</View>
);

/* ── Section header ───────────────────────────────────────────── */
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionRow}>
      <Text style={type.h2 as any}>{title}</Text>
      {action ? <Pressable onPress={onAction} hitSlop={10}><Text style={s.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

/* ── Empty / error state ──────────────────────────────────────── */
export function EmptyState({ icon, title, text, actionLabel, onAction }: {
  icon: IconName; title: string; text?: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}><Ionicons name={icon} size={30} color={color.brand} /></View>
      <Text style={s.emptyTitle}>{title}</Text>
      {text ? <Text style={s.emptyText}>{text}</Text> : null}
      {actionLabel ? <Button title={actionLabel} onPress={onAction} compact variant="soft" style={{ marginTop: space.sm }} /> : null}
    </View>
  );
}

/* ── Skeleton shimmer block ───────────────────────────────────── */
export function Skeleton({ height = 120, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  const o = useRef(new Animated.Value(0.5)).current;
  React.useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ]));
    l.start(); return () => l.stop();
  }, [o]);
  return <Animated.View style={[{ height, borderRadius: radius.lg, backgroundColor: color.line, opacity: o }, style]} />;
}

/* ── Route line: ● Kigali ─────── ● Huye ──────────────────────── */
export function RouteLine({ from, to, light }: { from: string; to: string; light?: boolean }) {
  const fg = light ? color.white : color.ink;
  return (
    <View style={s.routeRow}>
      <View style={{ flex: 1 }}>
        <Text style={[s.routeLabel, light && { color: 'rgba(255,255,255,.7)' }]}>FROM</Text>
        <Text style={[s.routeCity, { color: fg }]} numberOfLines={1}>{from}</Text>
      </View>
      <View style={s.routeMid}>
        <View style={[s.routeDot, { backgroundColor: color.sun }]} />
        <View style={[s.routeDash, light && { borderColor: 'rgba(255,255,255,.4)' }]} />
        <Ionicons name="bus" size={16} color={light ? color.white : color.brand} />
        <View style={[s.routeDash, light && { borderColor: 'rgba(255,255,255,.4)' }]} />
        <View style={[s.routeDot, { backgroundColor: light ? color.white : color.brand }]} />
      </View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={[s.routeLabel, light && { color: 'rgba(255,255,255,.7)' }]}>TO</Text>
        <Text style={[s.routeCity, { color: fg }]} numberOfLines={1}>{to}</Text>
      </View>
    </View>
  );
}

/* ── Ticket "tear-off" divider with notches ───────────────────── */
export const TearLine = ({ bg = color.bg }: { bg?: string }) => (
  <View style={s.tearWrap}>
    <View style={[s.notch, { left: -10, backgroundColor: bg }]} />
    <View style={s.tearDash} />
    <View style={[s.notch, { right: -10, backgroundColor: bg }]} />
  </View>
);

/* ── Label / value pair ───────────────────────────────────────── */
export const Fact = ({ label, value, align }: { label: string; value: string; align?: 'right' }) => (
  <View style={{ flex: 1, alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
    <Text style={s.factLabel}>{label}</Text>
    <Text style={[s.factValue, type.num]} numberOfLines={1}>{value}</Text>
  </View>
);

const s = StyleSheet.create({
  btn: { minHeight: 54, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: space.xl },
  btnCompact: { minHeight: hit.minTap - 4, paddingHorizontal: space.lg },
  btnText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.1 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  chip: { minWidth: 64, alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1.5, borderColor: color.line, backgroundColor: color.card },
  chipLabel: { fontSize: 14, fontWeight: '800', color: color.ink },
  chipSub: { fontSize: 11, fontWeight: '600', color: color.muted, marginTop: 1 },
  card: { backgroundColor: color.card, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, padding: space.lg },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionAction: { color: color.brand, fontWeight: '800', fontSize: 13 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: space.xl, gap: 8 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: color.ink, textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 20, color: color.sub, textAlign: 'center', maxWidth: 290 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: color.muted },
  routeCity: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginTop: 2 },
  routeMid: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeDash: { width: 14, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: color.line },
  tearWrap: { height: 20, justifyContent: 'center', marginHorizontal: -space.lg },
  tearDash: { marginHorizontal: space.lg + 4, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: color.line },
  notch: { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: color.line },
  factLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: color.muted },
  factValue: { fontSize: 15, fontWeight: '800', color: color.ink, marginTop: 3 },
});
