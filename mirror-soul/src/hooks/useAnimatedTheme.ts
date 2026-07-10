import { useMemo } from 'react';
import { useDerivedValue, withTiming, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useActiveTheme } from '@/src/store/useThemeStore';
import { lightTheme, darkTheme, ThemeColors } from '@/src/constants/theme';

export const useAnimatedTheme = () => {
  const activeTheme = useActiveTheme();
  
  // 1. Raw Colors for non-animated components (SVGs, StatusBar, etc)
  const colors: ThemeColors = activeTheme === 'dark' ? darkTheme : lightTheme;

  // 2. Reanimated SharedValues for smooth transition
  // We use useDerivedValue to reactively update the color based on activeTheme changes.
  // withTiming interpolates the hex color transition over 400ms smoothly.
  
  const bgPrimary = useDerivedValue(() => {
    return withTiming(activeTheme === 'dark' ? darkTheme.background.primary : lightTheme.background.primary, { duration: 400 });
  }, [activeTheme]);

  const bgCard = useDerivedValue(() => {
    return withTiming(activeTheme === 'dark' ? darkTheme.background.card : lightTheme.background.card, { duration: 400 });
  }, [activeTheme]);

  const bgGlass = useDerivedValue(() => {
    return withTiming(activeTheme === 'dark' ? darkTheme.background.glass : lightTheme.background.glass, { duration: 400 });
  }, [activeTheme]);

  const textPrimary = useDerivedValue(() => {
    return withTiming(activeTheme === 'dark' ? darkTheme.text.primary : lightTheme.text.primary, { duration: 400 });
  }, [activeTheme]);

  const textSecondary = useDerivedValue(() => {
    return withTiming(activeTheme === 'dark' ? darkTheme.text.secondary : lightTheme.text.secondary, { duration: 400 });
  }, [activeTheme]);

  const borderPrimary = useDerivedValue(() => {
    return withTiming(activeTheme === 'dark' ? darkTheme.border.primary : lightTheme.border.primary, { duration: 400 });
  }, [activeTheme]);

  // 3. Pre-built Animated Styles for convenience
  const animatedBackground = useAnimatedStyle(() => {
    return { backgroundColor: bgPrimary.value };
  });

  const animatedCardBackground = useAnimatedStyle(() => {
    return { backgroundColor: bgCard.value };
  });

  const animatedGlassBackground = useAnimatedStyle(() => {
    return { backgroundColor: bgGlass.value };
  });

  const animatedText = useAnimatedStyle(() => {
    return { color: textPrimary.value };
  });

  const animatedTextSecondary = useAnimatedStyle(() => {
    return { color: textSecondary.value };
  });

  const animatedBorder = useAnimatedStyle(() => {
    return { borderColor: borderPrimary.value };
  });

  return {
    colors, // raw colors
    activeTheme,
    // Animated styles
    animatedBackground,
    animatedCardBackground,
    animatedGlassBackground,
    animatedText,
    animatedTextSecondary,
    animatedBorder,
    // Raw shared values if needed for custom interpolation
    shared: {
      bgPrimary,
      textPrimary,
      borderPrimary
    }
  };
};
