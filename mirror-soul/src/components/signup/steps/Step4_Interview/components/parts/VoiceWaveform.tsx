import {Colors, Radii, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * 실시간 음성 파동을 시각화하는 컴포넌트.
 * 현재는 UI 목적으로 일정한 애니메이션 루프를 보여주며,
 * 추후 실제 볼륨 데이터(decibel)를 전달받아 반응하도록 확장 가능합니다.
 */
export default function VoiceWaveform() {
  // 5개의 막대(bar) 애니메이션 값 생성
  const animValues = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.6),
    new Animated.Value(0.9),
    new Animated.Value(0.5),
    new Animated.Value(0.4),
  ]).current;

  useEffect(() => {
    // 각 막대별로 무작위 높이 애니메이션 실행
    const animations = animValues.map((anim, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.7 + 0.3,
            duration: 300 + index * 50,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 300 + index * 50,
            useNativeDriver: false,
          }),
        ])
      );
    });

    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, [animValues]);

  return (
    <LinearGradient
      colors={Colors.glass.recordingBg}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.container}
    >
      <View style={styles.waveContainer}>
        {animValues.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                height: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, 40], // 최소 4px, 최대 40px 높이
                }),
              },
            ]}
          />
        ))}
        {/* 대칭을 위해 5개를 더 추가 */}
        {animValues.slice().reverse().map((anim, i) => (
          <Animated.View
            key={`rev-${i}`}
            style={[
              styles.bar,
              {
                height: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, 30],
                }),
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80, // 유저 요청: 79.995px
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs, // 유저 요청: 3.997px
  },
  bar: {
    width: 3,
    backgroundColor: Colors.primary.electricCyan,
    borderRadius: 2,
    opacity: 0.8,
  },
});
