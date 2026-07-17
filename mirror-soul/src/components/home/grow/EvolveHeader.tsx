import {Colors, FontFamily} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장 탭 헤더 (SRP)
 * 중앙에 타이틀만 렌더링합니다.
 */
export default function EvolveHeader() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>내 트윈 성장시키기</Text>
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
    fontFamily: FontFamily.sans,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  },
});
