import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import GreenCheckIcon from '@/assets/images/common/Green_check.svg';
import { Colors } from '@/src/constants/theme';

interface CompleteCheckProps {
  label: string;
}

/**
 * CompleteCheck 컴포넌트
 * 인증 성공 시 나타나는 애니메이션 포함 체크 요소. (SRP)
 */
export default function CompleteCheck({ label }: CompleteCheckProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GreenCheckIcon width={16} height={16} />
      <Text style={styles.text}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 20,
    flexDirection: 'row', // Horizontal alignment
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: Colors.primary.successGreen,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
