import React from 'react';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * Step2Header 컴포넌트 (SRP)
 * 회원가입 2단계의 타이틀과 서브타이틀을 렌더링합니다.
 */
export default function Step2Header() {
  const { colors } = useThemeColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text.primary }]}>기본 프로필</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>당신에게 맞는 완벽한 매칭을 찾아드릴게요</Text>
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
