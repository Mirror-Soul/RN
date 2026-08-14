import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface AIOrbProps {
  size?: number;
}

/**
 * 브랜드 3색(시안/퍼플/핑크)이 서로 다른 리듬으로 떠다니며 섞이는 "살아있는" 오브.
 * 정적 아이콘 대신 AI가 실시간으로 사고/응답하는 느낌을 주는 유기적 비주얼.
 * 통화 관련 화면 전반(연결 대기, 연결됐지만 아직 영상 트랙이 없는 상태)에서 공용으로 쓴다 —
 * "AI의 존재감"을 나타내는 비주얼이 화면마다 다르지 않도록 하나로 통일한다.
 */
export default function AIOrb({ size = 120 }: AIOrbProps) {
  const blobA = useRef(new Animated.Value(0)).current;
  const blobB = useRef(new Animated.Value(0)).current;
  const blobC = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = (value: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

    const animations = [float(blobA, 2600, 0), float(blobB, 3100, 250), float(blobC, 2800, 500)];
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [blobA, blobB, blobC]);

  const blobStyle = (value: Animated.Value, dx: number, dy: number, scaleFrom: number, scaleTo: number) => ({
    transform: [
      { translateX: value.interpolate({ inputRange: [0, 1], outputRange: [-dx, dx] }) },
      { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [dy, -dy] }) },
      { scale: value.interpolate({ inputRange: [0, 1], outputRange: [scaleFrom, scaleTo] }) },
    ],
  });

  return (
    <View
      style={[
        styles.orbCore,
        { width: size, height: size, borderRadius: size / 2, shadowRadius: size * 0.2 },
      ]}
    >
      <Animated.View
        style={[
          styles.blob,
          styles.blobCyan,
          { width: size * 0.85, height: size * 0.85, borderRadius: size, top: -size * 0.1, left: -size * 0.15 },
          blobStyle(blobA, size * 0.12, size * 0.08, 1, 1.2),
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blobPurple,
          {
            width: size * 0.85,
            height: size * 0.85,
            borderRadius: size,
            bottom: -size * 0.15,
            right: -size * 0.1,
          },
          blobStyle(blobB, size * 0.13, size * 0.1, 1.15, 0.95),
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blobPink,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size,
            bottom: -size * 0.05,
            left: -size * 0.05,
          },
          blobStyle(blobC, size * 0.08, size * 0.13, 0.95, 1.1),
        ]}
      />
      <View
        style={[
          styles.orbHighlight,
          {
            top: size * 0.14,
            left: size * 0.18,
            width: size * 0.28,
            height: size * 0.18,
            borderRadius: size,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orbCore: {
    overflow: 'hidden',
    backgroundColor: '#0B0B14',
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    elevation: 10,
  },
  blob: {
    position: 'absolute',
    opacity: 0.75,
  },
  blobCyan: {
    backgroundColor: Colors.primary.electricCyan,
  },
  blobPurple: {
    backgroundColor: Colors.primary.vividPurple,
  },
  blobPink: {
    backgroundColor: '#F6339A',
  },
  orbHighlight: {
    position: 'absolute',
    backgroundColor: Colors.glass.white20,
    transform: [{ rotate: '-18deg' }],
  },
});
