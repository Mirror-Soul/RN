import { Colors, Radii } from '@/src/constants/theme';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';

interface InterviewAIBoxProps {
  category?: string;
  question: string;
}

export default function InterviewAIBox({ category, question }: InterviewAIBoxProps) {
  return (
    <View style={styles.outerContainer}>
      <BlurView 
        intensity={Platform.OS === 'ios' ? 40 : 100} 
        tint="dark" 
        style={styles.container}
      >
        <View style={styles.topRow}>
          <View style={styles.aiLabelWrapper}>
            <View style={styles.aiDot} />
            <Text style={styles.aiLabelText}>AI 인터뷰어</Text>
          </View>

          {category ? (
            <View style={styles.badgeWrapper}>
              <Text style={styles.badgeText}>{category}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.paragraphWrapper}>
          <Text style={styles.paragraphText}>{question}</Text>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    borderRadius: Radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.white10,
  },
  container: {
    width: '100%',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    borderRadius: 4,
    backgroundColor: Colors.primary.electricCyan,
  },
  aiLabelText: {
    color: Colors.primary.electricCyan,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  badgeWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radii.lg2,
    backgroundColor: 'rgba(163, 114, 255, 0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(163, 114, 255, 0.3)',
  },
  badgeText: {
    color: Colors.primary.vividPurple,
    fontSize: 11,
    fontWeight: '500',
  },
  paragraphWrapper: {
    marginTop: 12,
    marginBottom: 20,
  },
  paragraphText: {
    color: Colors.neutral.pureWhite,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
});
