import {Colors, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장 미션 섹션 타이틀 (SRP)
 */
export default function EvolveBodyTitle() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.text.primary }]}>성장 미션</Text>
      <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
        미션을 완료하고 내 트윈을 더 나답게 만들어보세요
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    alignSelf: 'stretch',
    gap: Spacing.xxs,
  },
  heading: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.medium,
    lineHeight: 30,
    letterSpacing: -0.449,
  },
  paragraph: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
  },
});
