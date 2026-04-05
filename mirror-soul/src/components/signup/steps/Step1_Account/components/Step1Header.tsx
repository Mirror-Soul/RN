import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';

/**
 * Step1Header 컴포넌트
 * 계정 생성 타이틀과 안전 인증 문구를 표시합니다.
 */
export default function Step1Header() {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>계정 생성</Text>
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
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 30,
    fontWeight: '500',
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
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});
