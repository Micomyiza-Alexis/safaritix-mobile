import { Platform, ViewStyle } from 'react-native';

export const color = {
  ink: '#0B1B2B', brand: '#0077B6', brandDeep: '#023E67', brandSoft: '#E6F4FB', brandMid: '#BFE3F5',
  sun: '#F4A261', sunSoft: '#FEF1E3', bg: '#F5F8FB', card: '#FFFFFF', line: '#E3EAF1', lineSoft: '#EEF3F8',
  text: '#0F172A', sub: '#475569', muted: '#7A8BA0', ok: '#12A150', okSoft: '#E3F7EC', warn: '#B7791F',
  warnSoft: '#FFF6E0', bad: '#C62828', badSoft: '#FDECEC', white: '#FFFFFF',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 };
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };
export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.8 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '800' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.8 },
  num: { fontVariant: ['tabular-nums'] as ('tabular-nums')[] },
};

const shadow = (opacity: number, r: number, y: number, c = '#0B1B2B'): ViewStyle =>
  Platform.select({
    ios: { shadowColor: c, shadowOpacity: opacity, shadowRadius: r, shadowOffset: { width: 0, height: y } },
    default: { elevation: Math.round(y / 1.5) },
  }) as ViewStyle;

export const elevation = { card: shadow(0.06, 12, 4), float: shadow(0.12, 24, 10), brand: shadow(0.32, 16, 8, '#0077B6') };
export const hit = { minTap: 48 };
export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral';
export const toneStyle: Record<Tone, { bg: string; fg: string }> = {
  ok: { bg: color.okSoft, fg: color.ok }, warn: { bg: color.warnSoft, fg: color.warn }, bad: { bg: color.badSoft, fg: color.bad },
  info: { bg: color.brandSoft, fg: color.brand }, neutral: { bg: color.lineSoft, fg: color.sub },
};

export function statusMeta(status?: string | null): { label: string; tone: Tone; past: boolean; trackable: boolean } {
  const s = String(status || '').toUpperCase();
  switch (s) {
    case 'CONFIRMED': return { label: 'Confirmed', tone: 'ok', past: false, trackable: true };
    case 'CHECKED_IN': return { label: 'Checked in', tone: 'info', past: false, trackable: true };
    case 'PENDING':
    case 'PENDING_PAYMENT': return { label: 'Awaiting payment', tone: 'warn', past: false, trackable: false };
    case 'CANCELLED': return { label: 'Cancelled', tone: 'bad', past: true, trackable: false };
    case 'COMPLETED': return { label: 'Completed', tone: 'neutral', past: true, trackable: false };
    case 'EXPIRED': return { label: 'Expired', tone: 'neutral', past: true, trackable: false };
    default: return { label: s ? s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : 'Unknown', tone: 'neutral', past: false, trackable: false };
  }
}

export const toLocalISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
