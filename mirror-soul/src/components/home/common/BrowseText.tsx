import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { isLoaded } from 'expo-font';
import { BrowseFontFamily } from '@/src/constants/browseFonts';

/** Keep system font scaling and Korean word wrapping throughout browsing. */
export function BrowseText({ style, variant = 'body', ...props }: TextProps & { variant?: 'body' | 'heading' }) {
  const weight = StyleSheet.flatten(style)?.fontWeight;
  const strong = weight === 'bold' || Number(weight) >= 600;
  const face = variant === 'heading'
    ? strong ? BrowseFontFamily.headingBold : BrowseFontFamily.heading
    : strong
    ? BrowseFontFamily.semibold
    : Number(weight) >= 500 ? BrowseFontFamily.medium : BrowseFontFamily.regular;
  // A font loading failure must not prevent browsing. Keep the original style as fallback.
  const fontStyle = isLoaded(face) ? { fontFamily: face, fontWeight: 'normal' as const } : undefined;
  return <Text lineBreakStrategyIOS="hangul-word" textBreakStrategy="highQuality" {...props} style={[style, fontStyle]} />;
}
