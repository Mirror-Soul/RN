import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * MovingBackground
 *
 * 인터뷰 화면의 배경을 관리합니다.
 * Step 1~3와의 일관성을 위해 회원가입 다크 배경(useThemeColors, 항상 다크 고정)을 참조합니다.
 */
export default function MovingBackground() {
  const { colors } = useThemeColors();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.primary }]} />
  );
}
