import { FontFamily, FontWeight, Spacing } from '@/src/constants/theme';
import React from 'react';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장 미션 섹션 타이틀 (SRP)
 * "Deep Learning Mission" 라벨 + 구분선을 렌더링합니다.
 */
export default function EvolveBodyTitle() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text.muted }]}>조금씩 더 닮아가기</Text>
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

    fontWeight: FontWeight.black,
    fontSize: 13,
    lineHeight: 22,
  },
  divider: {
    flex: 1,
    height: 1,
  },
});
