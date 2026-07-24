import {Colors, Radii, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface InterviewAIBoxProps {
  category?: string;
  question: string;
}

export default function InterviewAIBox({ category, question }: InterviewAIBoxProps) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { backgroundColor: colors.background.card || 'rgba(255, 255, 255, 0.12)' }]}>
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
          <Text style={[styles.paragraphText, { color: colors.text.primary }]}>{question}</Text>
        </View>
      </View>
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
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xs,
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
    gap: Spacing.sm,
  },
  aiDot: {
    width: 8,
    height: 8,
    borderRadius: Radii.xs,
    backgroundColor: Colors.primary.electricCyan,
  },
  aiLabelText: {
    color: Colors.primary.electricCyan,
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.1,
  },
  badgeWrapper: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: 10,
    borderRadius: Radii.lg2,
    backgroundColor: 'rgba(163, 114, 255, 0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(163, 114, 255, 0.3)',
  },
  badgeText: {
    color: Colors.primary.vividPurple,
    fontSize: 11,
    fontWeight: FontWeight.medium,
  },
  paragraphWrapper: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  paragraphText: {
    fontSize: 17,
    fontWeight: FontWeight.regular,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
});
