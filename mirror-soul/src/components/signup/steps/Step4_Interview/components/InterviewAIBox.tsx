import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InterviewAIBoxProps {
  category: string;
  question: string;
}

export default function InterviewAIBox({ category, question }: InterviewAIBoxProps) {
  return (
    <LinearGradient
      colors={[Colors.glass.cyan10, Colors.glass.purple10_mbti]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.topRow}>
        <View style={styles.aiLabelWrapper}>
          <View style={styles.aiDot} />
          <Text style={styles.aiLabelText}>AI 인터뷰어</Text>
        </View>

        <View style={styles.badgeWrapper}>
          <Text style={styles.badgeText}>{category}</Text>
        </View>
      </View>

      <View style={styles.paragraphWrapper}>
        <Text style={styles.paragraphText}>{question}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 25.83,
    paddingRight: 25.83,
    paddingBottom: 1.836,
    paddingLeft: 25.83,
    borderRadius: Radii.xl,
    borderWidth: 1.836,
    borderColor: Colors.glass.white20,
    shadowColor: Colors.primary.soulBlack,
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  aiLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.xs,
    backgroundColor: Colors.primary.electricCyan,
  },
  aiLabelText: {
    color: Colors.primary.electricCyan,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  badgeWrapper: {
    paddingTop: 5.221,
    paddingRight: 9.926,
    paddingBottom: 3.996,
    paddingLeft: 12.604,
    borderRadius: Radii.lg2,
    borderWidth: 0.612,
    borderColor: Colors.glass.purple30_mbti,
    backgroundColor: Colors.glass.purple20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.primary.vividPurple,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  paragraphWrapper: {
    paddingTop: 0.672,
    paddingRight: 5.28,
    marginTop: 8,
    marginBottom: 24,
  },
  paragraphText: {
    color: Colors.neutral.pureWhite,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 29.25,
    letterSpacing: -0.439,
  },
});
