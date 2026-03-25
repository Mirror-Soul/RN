import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Colors } from '@/src/constants/theme';

/**
 * 회원가입 화면 전용 방사형 그라디언트 컴포넌트
 */
export default function SignupBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.primary.soulBlack }]} />
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="grad1"
            cx="67.07%"
            cy="50%"
            rx="60%"
            ry="60%"
            fx="67.07%"
            fy="50%"
          >
            <Stop offset="0" stopColor={Colors.glass.purple08} stopOpacity="1" />
            <Stop offset="0.6" stopColor={Colors.primary.soulBlack} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
      </Svg>
    </View>
  );
}
