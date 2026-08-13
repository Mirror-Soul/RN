import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 회원가입 화면 전용 배경 컴포넌트
 * 미니멀 톤을 위해 장식적인 방사형 글로우 없이 단색 배경만 사용한다.
 */
export default function SignupBackground() {
  const { colors } = useThemeColors();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.primary }]} />
  );
}
