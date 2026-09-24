export const Colors = {
  primary: '#0077B6',
  primaryDark: '#005F8E',
  primaryLight: '#E6F4FB',

  secondary: '#F4A261',

  success: '#27AE60',
  danger: '#B42318',
  warning: '#F59E0B',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textLight: '#94A3B8',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  overlay: 'rgba(15, 23, 42, 0.5)',
};

export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
  },

  heading1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800' as const,
  },

  heading2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700' as const,
  },

  heading3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700' as const,
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },

  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
  },

  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },

  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },

  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const Shadows = {
  small: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  medium: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};