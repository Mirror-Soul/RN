import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>음성 인터뷰</Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
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
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 30,
    fontWeight: '500',
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
    color: '#99A1AF',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});

