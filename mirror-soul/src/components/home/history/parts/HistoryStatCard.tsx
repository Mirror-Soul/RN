import { Colors, Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface HistoryStatCardProps {
  count: number | string;
  label: string;
  countColor?: string;
}

/**
 * 통계 수치를 보여주는 카드(SRP)
 */
export default function HistoryStatCard({
  count,
  label,
  countColor,
}: HistoryStatCardProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <View style={styles.countWrapper}>
        <Text style={[styles.countText, countColor ? { color: countColor } : { color: colors.text.primary }]}>{count}</Text>
      </View>
      <View style={styles.labelWrapper}>
        <Text style={[styles.labelText, { color: colors.text.secondary }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 3등분
    height: 85,
    paddingTop: 16.6,
    paddingHorizontal: 16.6,
    paddingBottom: 0.6,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
  },
  countWrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 32, // 133.333%
    letterSpacing: 0.07,
    textAlign: 'center',
  },
  labelWrapper: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16, // 133.333%
    textAlign: 'center',
  },
});
