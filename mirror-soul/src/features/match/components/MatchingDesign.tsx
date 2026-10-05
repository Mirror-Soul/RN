import { Colors } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/** History/growth already pair cyan and purple. Reuse those hues as quiet accents. */
export function useMatchingDesign() {
  const theme = useThemeColors();
  return {
    ...theme,
    palette: {
      tint: Colors.glass.purple10,
      coolTint: Colors.glass.cyan10_d3,
      softBorder: Colors.glass.purple30,
      accentInk: theme.isDark ? Colors.primary.vividPurple : deepen(Colors.primary.vividPurple, 0.52),
      cyanInk: theme.isDark ? Colors.primary.electricCyan : deepen(Colors.primary.electricCyan, 0.46),
      // Mix the app's existing cyan with white, keeping controls soft in both themes.
      buttonBase: lighten(Colors.primary.electricCyan, 0.82),
      buttonBorder: lighten(Colors.primary.electricCyan, 0.65),
      secondaryButton: theme.isDark ? Colors.glass.cyan10_d3 : lighten(Colors.primary.electricCyan, 0.95),
      onAccent: deepen(Colors.primary.electricCyan, 0.27),
    },
  };
}

/** Darken the existing hue for readable text on white; no new hue is introduced. */
function deepen(hex: string, factor: number) {
  return '#' + [1, 3, 5].map(offset => Math.round(parseInt(hex.slice(offset, offset + 2), 16) * factor).toString(16).padStart(2, '0')).join('');
}

function lighten(hex: string, whiteRatio: number) {
  return '#' + [1, 3, 5].map(offset => Math.round(parseInt(hex.slice(offset, offset + 2), 16) * (1 - whiteRatio) + 255 * whiteRatio).toString(16).padStart(2, '0')).join('');
}

export { BrowseText as MatchingText } from '@/src/components/home/common/BrowseText';
