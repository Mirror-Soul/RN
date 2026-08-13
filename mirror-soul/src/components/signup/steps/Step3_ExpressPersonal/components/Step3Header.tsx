import React from 'react';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * Step3Header 컴포넌트 (SRP)
 * 회원가입 3단계의 타이틀과 서브타이틀을 렌더링합니다.
 */
export default function Step3Header() {
  const { colors } = useThemeColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text.primary }]}>성격 유형</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>당신의 성격을 알려주세요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
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
  },
});
