import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Colors } from '@/src/constants/theme';

export default function FaceScanGlow() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="faceScanGlow"
            cx="50%"
            cy="50%"
            rx="125.41%"
            ry="54.52%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0" stopColor={Colors.primary.electricCyan} stopOpacity="0.10" />
            <Stop offset="0.7" stopColor={Colors.primary.soulBlack} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#faceScanGlow)" />
      </Svg>
    </View>
  );
}
