// Onyx Digital Property — Design Tokens
// Reproduction fidèle de l'identité visuelle web

export const Colors = {
  // Backgrounds (dark navy theme)
  background: '#0A1628',       // --background
  surface: '#111E35',          // --surface
  surfaceElevated: '#182540',  // --surface-elevated
  card: '#111E35',             // --card

  // Text
  foreground: '#F0F4FA',       // --foreground
  mutedForeground: '#7A8BAA',  // --muted-foreground
  muted: '#1C2E4A',            // --muted

  // Brand Gold
  gold: '#C9A84C',             // --gold
  goldLight: '#E8C96B',
  goldDark: '#A8832A',
  goldForeground: '#0A1628',

  // Status
  success: '#22C55E',
  successLight: '#16A34A20',
  warning: '#F59E0B',
  warningLight: '#F59E0B20',
  error: '#EF4444',
  errorLight: '#EF444420',
  info: '#3B82F6',

  // Borders
  border: '#1E3050',
  borderLight: '#263D60',

  // Payment status colors
  paid: '#22C55E',
  pending: '#F59E0B',
  late: '#EF4444',
  partial: '#8B5CF6',

  // Transparent overlays
  overlay: 'rgba(10, 22, 40, 0.85)',
  white10: 'rgba(255, 255, 255, 0.10)',
  white20: 'rgba(255, 255, 255, 0.20)',
  white5: 'rgba(255, 255, 255, 0.05)',
} as const;

export const Fonts = {
  display: 'Sora',
  sans: 'PlusJakartaSans',
  mono: 'SpaceMono',
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
} as const;

export const Radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Pack tiers
export const PackColors = {
  essentiel: Colors.mutedForeground,
  performance: Colors.gold,
  premium: '#A78BFA',
} as const;

export type PackTier = 'essentiel' | 'performance' | 'premium';
export type AppRole = 'proprietaire' | 'locataire' | 'investisseur' | 'service_technique';
