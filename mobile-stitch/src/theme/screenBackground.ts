/** Root screen fill: transparent in dark so the global black + animated backdrop shows through */
export function screenRootBg(isDark: boolean, lightFill: string): string {
  return isDark ? 'transparent' : lightFill;
}
