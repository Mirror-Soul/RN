import React from 'react';
import { Text, type TextProps } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/** The same neutral surfaces and cyan/purple highlights used by history and growth. */
export function useMatchingDesign() {
  const theme = useThemeColors();
  return {
    ...theme,
    palette: {
      tint: theme.colors.background.glass,
      tintText: theme.colors.text.secondary,
      gradient: Colors.gradient.twinCardHeader,
      onAccent: theme.colors.background.primary,
      onGradient: Colors.primary.soulBlack,
    },
  };
}

/** Preserve native accessibility scaling and Korean word wrapping. */
export function MatchingText(props: TextProps) {
  return (
    <Text
      lineBreakStrategyIOS="hangul-word"
      textBreakStrategy="highQuality"
      {...props}
    />
  );
}
