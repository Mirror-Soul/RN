import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { FontFamily, FontSize, FontWeight } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/** matchingEnabled controls recommendation exposure, not an AI analysis job or browsing. */
export default function AiStatusTicker({
  isMatchingEnabled,
  isError,
}: {
  isMatchingEnabled?: boolean | null;
  isError?: boolean;
}) {
  const { colors } = useThemeColors();
  const title = isError
    ? '추천 노출 확인 필요'
    : isMatchingEnabled == null
      ? '추천 노출 확인 중'
      : '추천 프로필';
  return (
    <Text
      accessibilityRole="header"
      style={[styles.title, { color: colors.text.primary }]}
    >
      {title}
    </Text>
  );
}
const styles = StyleSheet.create({
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    lineHeight: 26,
  },
});
