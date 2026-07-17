import { useDerivedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useActiveTheme } from '@/src/store/useThemeStore';
import { lightTheme, darkTheme, ThemeColors } from '@/src/constants/theme';

const D = darkTheme;
const L = lightTheme;
const DURATION = 350;

export const useAnimatedTheme = () => {
  const activeTheme = useActiveTheme();
  const isDark = activeTheme === 'dark';

  // 1. Raw Colors (non-animated, for SVGs, icons, etc.)
  const colors: ThemeColors = isDark ? D : L;

  // ─── SharedValues ──────────────────────────────────────
  const bgPrimary = useDerivedValue(() =>
    withTiming(isDark ? D.background.primary : L.background.primary, { duration: DURATION })
  );
  const bgCard = useDerivedValue(() =>
    withTiming(isDark ? D.background.card : L.background.card, { duration: DURATION })
  );
  const bgGlass = useDerivedValue(() =>
    withTiming(isDark ? D.background.glass : L.background.glass, { duration: DURATION })
  );
  const textPrimary = useDerivedValue(() =>
    withTiming(isDark ? D.text.primary : L.text.primary, { duration: DURATION })
  );
  const textSecondary = useDerivedValue(() =>
    withTiming(isDark ? D.text.secondary : L.text.secondary, { duration: DURATION })
  );
  const textMuted = useDerivedValue(() =>
    withTiming(isDark ? D.text.muted : L.text.muted, { duration: DURATION })
  );
  const borderPrimary = useDerivedValue(() =>
    withTiming(isDark ? D.border.primary : L.border.primary, { duration: DURATION })
  );

  // ─── Pre-built Animated Styles ──────────────────────────
  const animatedBackground = useAnimatedStyle(() => ({
    backgroundColor: bgPrimary.value,
  }));

  const animatedCardBackground = useAnimatedStyle(() => ({
    backgroundColor: bgCard.value,
    borderColor: borderPrimary.value,
  }));

  const animatedGlassBackground = useAnimatedStyle(() => ({
    backgroundColor: bgGlass.value,
    borderColor: borderPrimary.value,
  }));

  const animatedText = useAnimatedStyle(() => ({
    color: textPrimary.value,
  }));

  const animatedTextSecondary = useAnimatedStyle(() => ({
    color: textSecondary.value,
  }));

  const animatedTextMuted = useAnimatedStyle(() => ({
    color: textMuted.value,
  }));

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: borderPrimary.value,
  }));

  return {
    colors,
    activeTheme,
    isDark,
    // Animated styles (use on Animated.View / Animated.Text)
    animatedBackground,
    animatedCardBackground,
    animatedGlassBackground,
    animatedText,
    animatedTextSecondary,
    animatedTextMuted,
    animatedBorder,
  };
};
