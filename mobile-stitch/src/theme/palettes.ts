/** Shared shape for dark / light — keep keys in sync */
export type ThemeColors = {
  background: string;
  surface: string;
  surfaceDim: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceBright: string;
  surfaceVariant: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  outline: string;
  outlineVariant: string;
  error: string;
  errorContainer: string;
  inverseOnSurface: string;
  glassBar: string;
  tabInactive: string;
  headerBar: string;
  hintPanel: string;
  mutedIcon: string;
  chevronMuted: string;
  tabPillActive: string;
};

export const darkPalette: ThemeColors = {
  background: '#070707',
  surface: '#070707',
  surfaceDim: '#070707',
  surfaceContainer: '#141414',
  surfaceContainerLow: '#101010',
  surfaceContainerLowest: '#030303',
  surfaceContainerHigh: '#1c1c1c',
  surfaceContainerHighest: '#262626',
  surfaceBright: '#2e2e2e',
  surfaceVariant: '#262626',
  onBackground: '#e5e2e1',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#bfcaba',
  primary: '#88d982',
  onPrimary: '#003909',
  primaryContainer: '#2e7d32',
  onPrimaryContainer: '#cbffc2',
  secondary: '#add0a6',
  secondaryContainer: '#304e2e',
  onSecondaryContainer: '#9cbe95',
  tertiary: '#ffb1c7',
  outline: '#8a9485',
  outlineVariant: '#3a4238',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  inverseOnSurface: '#1c1c1c',
  glassBar: 'rgba(7, 7, 7, 0.96)',
  tabInactive: '#737373',
  headerBar: 'rgba(7, 7, 7, 0.94)',
  hintPanel: 'rgba(7, 7, 7, 0.58)',
  mutedIcon: '#9ca3af',
  chevronMuted: '#6b7280',
  tabPillActive: 'rgba(46, 125, 50, 0.22)',
};

export const lightPalette: ThemeColors = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceDim: '#eceee9',
  surfaceContainer: '#eef1eb',
  surfaceContainerLow: '#e3e6e0',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#d8ddd6',
  surfaceContainerHighest: '#c9cfc6',
  surfaceBright: '#ffffff',
  surfaceVariant: '#dee4d8',
  onBackground: '#1a1c19',
  onSurface: '#1a1c19',
  onSurfaceVariant: '#43483e',
  primary: '#2e7d32',
  onPrimary: '#ffffff',
  primaryContainer: '#c8e6c9',
  onPrimaryContainer: '#0d3812',
  secondary: '#52634f',
  secondaryContainer: '#d8e8d4',
  onSecondaryContainer: '#3a4a39',
  tertiary: '#8b4a62',
  outline: '#72786f',
  outlineVariant: '#c2c8bd',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  inverseOnSurface: '#f1f1ea',
  glassBar: '#ffffff',
  tabInactive: '#5c5f57',
  headerBar: '#ffffff',
  hintPanel: 'rgba(0, 0, 0, 0.04)',
  mutedIcon: '#6b7280',
  chevronMuted: '#757575',
  tabPillActive: 'rgba(46, 125, 50, 0.16)',
};

export type ColorScheme = 'light' | 'dark';

export function paletteFor(scheme: ColorScheme): ThemeColors {
  return scheme === 'light' ? lightPalette : darkPalette;
}

/** @deprecated use useTheme().colors — kept for gradual migration */
export const colors = darkPalette;

export type ColorKey = keyof ThemeColors;
