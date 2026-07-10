import { Colors, Radii } from '@/src/constants/theme';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';
import Animated from 'react-native-reanimated';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

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
  const theme = useAnimatedTheme();

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.container,
        isActive ? theme.animatedCardBackground : theme.animatedGlassBackground,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Animated.Text style={[styles.label, isActive ? theme.animatedText : theme.animatedTextMuted]}>
        {label}
      </Animated.Text>
    </AnimatedTouchableOpacity>
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
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20, // 142.857%
    letterSpacing: -0.15,
    textAlign: 'center',
  },
});
