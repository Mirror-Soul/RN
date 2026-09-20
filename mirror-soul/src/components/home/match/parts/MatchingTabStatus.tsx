import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface MatchingTabStatusProps {
  message: string;
  isLoading?: boolean;
  onRetry?: () => void;
}

/** Matching 화면의 각 탭(만남 신청/메시지방)에서 로딩·에러·빈 상태를 공통으로 보여준다 */
export default function MatchingTabStatus({ message, isLoading, onRetry }: MatchingTabStatusProps) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      {isLoading ? (
        <ActivityIndicator color={Colors.primary.electricCyan} />
      ) : (
        <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text>
      )}
      {onRetry && !isLoading && (
        <Pressable onPress={onRetry} style={styles.retryButton} accessibilityRole="button" accessibilityLabel="다시 시도">
          <Text style={styles.retryText}>다시 시도</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xxl,
    borderWidth: 1,
    borderRadius: Radii.xxl,
    paddingVertical: Spacing.giant,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  message: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.lg,
    backgroundColor: Colors.primary.electricCyan,
  },
  retryText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xs,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.primary.soulBlack,
  },
});
