import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export interface HistoryFilterButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

/**
 * 리스트 필터용 개별 버튼 (SRP)
 * 컴팩트 pill 버튼 스타일 — 콘텐츠 너비에 맞게 자동 조절됩니다.
 */
export default function HistoryFilterButton({
  label,
  isActive,
  onPress,
}: HistoryFilterButtonProps) {
  const { colors } = useThemeColors();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive
          ? { backgroundColor: colors.background.card, borderColor: colors.border.primary }
          : { backgroundColor: 'transparent', borderColor: 'transparent' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text
        style={[
          styles.label,
          isActive ? { color: colors.text.primary } : { color: colors.text.muted },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 0.612,
    height: '100%',
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black as any,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
