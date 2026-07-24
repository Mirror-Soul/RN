import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장 미션 섹션 타이틀 (SRP)
 * "Deep Learning Mission" 라벨 + 구분선을 렌더링합니다.
 */
export default function EvolveBodyTitle() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text.muted }]}>Deep Learning Mission</Text>
      <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 3.1,
    textTransform: 'uppercase',
  },
  divider: {
    flex: 1,
    height: 1,
  },
});
