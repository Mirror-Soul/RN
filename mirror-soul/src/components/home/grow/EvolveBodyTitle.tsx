import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

/**
 * 성장 미션 섹션 타이틀 (SRP)
 */
export default function EvolveBodyTitle() {
  const { animatedText, animatedTextSecondary } = useAnimatedTheme();

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.heading, animatedText]}>성장 미션</Animated.Text>
      <Animated.Text style={[styles.paragraph, animatedTextSecondary]}>
        미션을 완료하고 내 트윈을 더 나답게 만들어보세요
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    alignSelf: 'stretch',
    gap: 2,
  },
  heading: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 30,
    letterSpacing: -0.449,
  },
  paragraph: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});
