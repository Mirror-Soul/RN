import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Colors, FontFamily, FontSize, FontWeight} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * Step1Header 컴포넌트
 * 계정 생성 타이틀과 안전 인증 문구를 표시합니다.
 */
export default function Step1Header() {
  const { colors } = useThemeColors();
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text.primary }]}>계정 생성</Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>안전한 계정 생성을 위해 본인인증이 필요합니다</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 63.986,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 7.995,
  },
  titleContainer: {
    height: 35.995,
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: 30,
    fontWeight: FontWeight.medium,
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subtitleContainer: {
    paddingHorizontal: 35.015,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  subtitle: {
    color: Colors.neutral.lightGray,
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});
