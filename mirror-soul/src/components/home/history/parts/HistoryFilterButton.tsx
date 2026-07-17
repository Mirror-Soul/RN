import {Colors, Radii, FontFamily} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

export interface HistoryFilterButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

/**
 * 리스트 필터용 개별 버튼 (SRP)
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
          : { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.label, isActive ? { color: colors.text.primary } : { color: colors.text.muted }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // 버튼들이 동일한 비율로 너비를 가짐
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md2, // 14px
    borderWidth: 0.612,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20, // 142.857%
    letterSpacing: -0.15,
    textAlign: 'center',
  },
});
