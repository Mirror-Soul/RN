import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface MessageDateDividerProps {
  label: string;
}

/**
 * 채팅 날짜 구분 배지 (예: "오늘", "어제", "2024.12.01")
 * 메시지 목록에서 날짜 그룹을 구분합니다.
 */
export default function MessageDateDivider({ label }: MessageDateDividerProps) {
  const { colors } = useThemeColors();

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={[styles.badge, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <Text style={[styles.label, { color: colors.text.muted }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderRadius: Radii.full,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 0.37,
    textTransform: 'uppercase',
  },
});
