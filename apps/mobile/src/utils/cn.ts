/**
 * Utility function to combine style objects and conditional styles
 * Adapted for StyleSheet usage instead of NativeWind
 */
export function cn(...styles: (any | undefined | null | false)[]): any {
  return styles.filter(Boolean).reduce((acc, style) => ({...acc, ...style}), {});
} 