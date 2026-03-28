import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface InterviewHeaderProps {
  title: string;
  currentQuestion: number;
  totalQuestions: number;
}

export default function InterviewHeader({
  title,
  currentQuestion,
  totalQuestions,
}: InterviewHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        Question {currentQuestion} of {totalQuestions}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subtitle: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
