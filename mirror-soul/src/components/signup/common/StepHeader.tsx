import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Props {
  title: string;
  subtitle: string;
}

/**
 * 회원가입 각 단계의 제목과 부제목을 렌더링하는 공통 헤더
 */
export default function StepHeader({ title, subtitle }: Props) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      </View>
      <View style={styles.subtitleWrapper}>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  titleWrapper: {
    width: '100%',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.semibold,
    lineHeight: 34,
  },
  subtitleWrapper: {
    width: '100%',
    flexShrink: 1,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
  }
});
