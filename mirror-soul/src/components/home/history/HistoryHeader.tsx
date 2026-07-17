import {Colors, FontFamily} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

/**
 * HistoryHeader 컴포넌트 (SRP)
 * 기록 화면의 상단 타이틀 영역을 렌더링합니다.
 */
export default function HistoryHeader() {
  const { colors } = useThemeColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>통화 기록</Text>
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
    fontFamily: FontFamily.sans,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28, // 140%
    letterSpacing: -0.449,
  },
});
