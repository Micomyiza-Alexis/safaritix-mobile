export const authColors = {
  primary: '#0077B6',
  primaryDeep: '#005F8E',
  primarySoft: '#E6F4FB',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  border: '#CBD5E1',
  borderStrong: '#94A3B8',
  error: '#B42318',
  errorSoft: '#FEF3F2',
  success: '#067647',
  successSoft: '#ECFDF3',
} as const;

export const authLayout = {
  maxContentWidth: 440,
  horizontalPadding: 24,
  radius: 12,
  controlHeight: 52,
  minTouch: 48,
  fieldGap: 16,
} as const;

// TODO: confirm against the backend's real register validation before shipping.
export const PASSWORD_MIN_LENGTH = 8;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;