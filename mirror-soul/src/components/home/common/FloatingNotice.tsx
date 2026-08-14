import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface FloatingNoticeProps {
  message: string | null;
  opacity: Animated.Value;
  /** 시트 하단 요소(확인 버튼 등)와 겹치지 않도록 띄울 높이 */
  bottom?: number;
}

/** useFloatingNotice와 짝을 이루는 표시 전용 컴포넌트 */
export default function FloatingNotice({ message, opacity, bottom = 96 }: FloatingNoticeProps) {
  const { colors } = useThemeColors();

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.notice,
        { bottom, backgroundColor: colors.background.elevated, borderColor: colors.state.danger, opacity },
      ]}
    >
      <Feather name="alert-circle" size={14} color={colors.state.danger} />
      <Text style={[styles.text, { color: colors.state.danger }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  notice: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.xl,
    borderWidth: 1,
    zIndex: 40,
    elevation: 40,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
