import React from 'react';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface InterviewHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
}

/**
 * InterviewHeader 컴포넌트 (SRP)
 * 회원가입 4단계의 타이틀과 인터뷰 진행률(서브타이틀)을 렌더링합니다.
 */
export default function InterviewHeader({
  currentQuestion,
  totalQuestions,
}: InterviewHeaderProps) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text.primary }]}>음성 인터뷰</Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
        질문 {currentQuestion} / {totalQuestions}
      </Text>
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

