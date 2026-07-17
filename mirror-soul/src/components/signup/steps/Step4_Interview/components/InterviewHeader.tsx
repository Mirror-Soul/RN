import React from 'react';
import {FontFamily, FontSize, FontWeight} from '@/src/constants/theme';

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
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text.primary }]}>음성 인터뷰</Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          질문 {currentQuestion} / {totalQuestions}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 63.986,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 7.995,
  },
  titleContainer: {
    height: 35.995,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: 30,
    fontWeight: FontWeight.medium,
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subtitleContainer: {
    paddingHorizontal: 49.015,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});

