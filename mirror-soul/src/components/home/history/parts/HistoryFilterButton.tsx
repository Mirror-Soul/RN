import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive ? styles.activeContainer : styles.inactiveContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
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
  activeContainer: {
    borderColor: Colors.glass.white20,
    backgroundColor: Colors.glass.white10,
  },
  inactiveContainer: {
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white5,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20, // 142.857%
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  activeLabel: {
    color: Colors.neutral.pureWhite, // #FFF
  },
  inactiveLabel: {
    color: Colors.neutral.lightGray, // #99A1AF
  },
});
