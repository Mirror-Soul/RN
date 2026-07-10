import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

/**
 * 성장 탭 헤더 (SRP)
 * 중앙에 타이틀만 렌더링합니다.
 */
export default function EvolveHeader() {
  const { animatedText } = useAnimatedTheme();

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, animatedText]}>내 트윈 성장시키기</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});
