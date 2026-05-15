import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/theme';

/**
 * MovingBackground
 * 
 * 인터뷰 화면의 배경을 관리합니다.
 * Step 1~3와의 일관성을 위해 Pure Black 배경을 제공하며,
 * 추후 다크/라이트 모드 확장을 위해 테마 색상을 참조합니다.
 */
export default function MovingBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary.soulBlack,
  },
});
