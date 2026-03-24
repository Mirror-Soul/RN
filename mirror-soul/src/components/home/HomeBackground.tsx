import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

/**
 * Home 화면 전용 다중 방사형 그라디언트(Radial Gradient) 배경 컴포넌트 
 * 디자인 시스템의 Electric Cyan, Vivid Purple 컬러를 바탕으로 한 백그라운드 효과 구현
 */
export default function HomeBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Base Background: #000 */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]} />
      
      {/* SVG Radial Gradients */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="grad1"
            cx="70.3%"
            cy="46.17%"
            rx="60%"
            ry="40%"
            fx="70.3%"
            fy="46.17%"
          >
            <Stop offset="0" stopColor="rgba(0, 255, 255, 0.18)" stopOpacity="1" />
            <Stop offset="1" stopColor="rgba(0, 0, 0, 0)" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient
            id="grad2"
            cx="29.7%"
            cy="53.84%"
            rx="60%"
            ry="40%"
            fx="29.7%"
            fy="53.84%"
          >
            <Stop offset="0" stopColor="rgba(147, 51, 234, 0.18)" stopOpacity="1" />
            <Stop offset="1" stopColor="rgba(0, 0, 0, 0)" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
      </Svg>
    </View>
  );
}
