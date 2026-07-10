import { Colors } from '@/src/constants/theme';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';
import Animated from 'react-native-reanimated';
import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * HistoryHeader 컴포넌트 (SRP)
 * 기록 화면의 상단 타이틀 영역을 렌더링합니다.
 */
export default function HistoryHeader() {
  const theme = useAnimatedTheme();
  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, theme.animatedText]}>통화 기록</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28, // 140%
    letterSpacing: -0.449,
  },
});
