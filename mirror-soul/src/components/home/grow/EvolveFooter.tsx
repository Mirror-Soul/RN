import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import useAnimatedTheme from '@/src/hooks/useAnimatedTheme';

/**
 * 성장 탭 하단 안내 카드 (SRP)
 */
export default function EvolveFooter() {
  const { animatedGlassBackground, animatedBorder, animatedText, animatedTextSecondary } = useAnimatedTheme();

  return (
    <Animated.View style={[styles.container, animatedGlassBackground, animatedBorder]}>
      <Animated.Text style={[styles.title, animatedText]}>완성도가 높을수록 좋은 이유</Animated.Text>
      <Animated.Text style={[styles.subTitle, animatedTextSecondary]}>
        트윈이 나를 더 잘 이해할수록 나와 잘 맞는 사람을 찾아주고, 더 자연스러운 대화를 나눌 수 있어요.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    alignSelf: 'stretch',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  subTitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 19.5,
  },
});
