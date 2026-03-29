/**
 * @deprecated Prefer `useTheme().colors` for light/dark support.
 * Default export matches dark palette for any legacy imports.
 */
export type { ColorKey, ColorScheme, ThemeColors } from './palettes';
export { colors, darkPalette, lightPalette, paletteFor } from './palettes';
