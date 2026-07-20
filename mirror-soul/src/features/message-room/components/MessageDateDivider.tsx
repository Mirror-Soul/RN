import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';

interface MessageDateDividerProps {
  label: string;
}

/**
 * 채팅 날짜 구분 배지 (예: "오늘", "어제", "2024.12.01")
 * 메시지 목록에서 날짜 그룹을 구분합니다.
 */
export default function MessageDateDivider({ label }: MessageDateDividerProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.label}>{label}</Text>
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
    backgroundColor: Colors.glass.white05,
    borderWidth: 1,
    borderColor: Colors.glass.white05,
    borderRadius: Radii.full,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 0.37,
    textTransform: 'uppercase',
    color: Colors.neutral.darkGray,
  },
});
