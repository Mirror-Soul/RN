import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '@/src/constants/theme';
import { BlurView } from 'expo-blur';

/**
 * MovingBackground
 * 
 * 인터뷰 화면의 배경에 미세하게 움직이는 그라데이션 효과를 제공합니다.
 * 여러 개의 글로우(Glow) 요소를 애니메이션화하여 몽환적이고 프리미엄한 느낌을 줍니다.
 */
export default function MovingBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 기본 배경색 */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.primary.soulBlack }]} />

      {/* 움직이는 글로우 요소 1 */}
      <MotiView
        from={{ translateX: -100, translateY: -100 }}
        animate={{
          translateX: width * 0.5,
          translateY: height * 0.2,
        }}
        transition={{
          type: 'timing',
          duration: 10000,
          loop: true,
        }}
        style={[styles.glow, { backgroundColor: Colors.primary.vividPurple, width: width * 0.8, height: width * 0.8, opacity: 0.15 }]}
      />

      {/* 움직이는 글로우 요소 2 */}
      <MotiView
        from={{ translateX: width, translateY: height }}
        animate={{
          translateX: width * 0.2,
          translateY: height * 0.5,
        }}
        transition={{
          type: 'timing',
          duration: 12000,
          loop: true,
        }}
        style={[styles.glow, { backgroundColor: Colors.primary.electricCyan, width: width * 0.7, height: width * 0.7, opacity: 0.1 }]}
      />

      {/* 전체 블러 처리로 부드러운 그라데이션 구현 */}
      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    borderRadius: 1000,
  },
});
