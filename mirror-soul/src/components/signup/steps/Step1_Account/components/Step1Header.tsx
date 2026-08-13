import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * Step1Header 컴포넌트
 * 계정 생성 타이틀과 안전 인증 문구를 표시합니다.
 */
export default function Step1Header() {
  const { colors } = useThemeColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>계정 생성</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>안전한 계정 생성을 위해 본인인증이 필요해요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 26,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
  }
});
