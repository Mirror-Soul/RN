import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Colors } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const { width, height } = Dimensions.get('window');

/**
 * Home 화면 전용 다중 방사형 그라디언트(Radial Gradient) 배경 컴포넌트 
 * 디자인 시스템의 Electric Cyan, Vivid Purple 컬러를 바탕으로 한 백그라운드 효과 구현
 */
export default function HomeBackground() {
  const { colors, isDark } = useThemeColors();
  const accentOpacity = isDark ? "0.2" : "0.15";
  const stopColor = colors.background.primary;
  const accentColor = colors.brand.accent;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Base Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.primary }]} />
      
      {/* SVG Radial Gradient — 미니멀 톤을 위해 하나의 은은한 글로우만 유지 */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="grad1"
            cx="50%"
            cy="38%"
            rx="70%"
            ry="45%"
            fx="50%"
            fy="38%"
          >
            <Stop offset="0" stopColor={accentColor} stopOpacity={accentOpacity} />
            <Stop offset="1" stopColor={stopColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
      </Svg>
    </View>
  );
}
