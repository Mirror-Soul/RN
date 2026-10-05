import React from 'react';
import { StyleSheet } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { FontFamily, FontSize, FontWeight } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/** matchingEnabled controls recommendation exposure, not an AI analysis job or browsing. */
export default function AiStatusTicker() {
  const { colors } = useThemeColors();
  return (
    <Text
      variant="heading"
      accessibilityRole="header"
      style={[styles.title, { color: colors.text.primary }]}
    >
      추천 프로필
    </Text>
  );
}
const styles = StyleSheet.create({
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: 26,
  },
});
