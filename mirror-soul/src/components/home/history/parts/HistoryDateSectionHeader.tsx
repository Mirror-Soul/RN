import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface HistoryDateSectionHeaderProps {
  dateLabel: string;
}

/**
 * 날짜 섹션 구분 헤더 컴포넌트 (SRP)
 * 날짜 레이블 좌측 + 우측 얇은 수평 구분선으로 구성됩니다.
 */
export default function HistoryDateSectionHeader({ dateLabel }: HistoryDateSectionHeaderProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.dateLabel, { color: colors.text.muted }]}>{dateLabel}</Text>
      <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  dateLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black as any,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
