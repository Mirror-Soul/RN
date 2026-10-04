import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** 화면 크기에 따라 함께 줄어드는 얼굴·어깨 가이드. 얼굴 위에는 문구를 올리지 않는다. */
export default function FaceGuideOverlay({ matching }: { matching: boolean }) {
  const stroke = matching ? '#5AE6E0' : 'rgba(255,255,255,0.8)';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible={false}>
      <Svg width="100%" height="100%" viewBox="0 0 300 400" preserveAspectRatio="none">
        <Path d="M150 62 C101 62 90 97 90 142 C90 189 112 225 150 225 C188 225 210 189 210 142 C210 97 199 62 150 62 Z" fill="none" stroke={stroke} strokeWidth={2} strokeDasharray={matching ? undefined : '8 6'} />
        <Path d="M30 360 L30 316 Q30 285 93 266 L113 247 M187 247 L207 266 Q270 285 270 316 L270 360" fill="none" stroke={stroke} strokeWidth={2} strokeDasharray="8 6" />
      </Svg>
    </View>
  );
}
