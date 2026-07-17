import React from 'react';
import { FontFamily } from '@/src/constants/theme';

import { View, Text, StyleSheet } from 'react-native';

/**
 * Step2Header 컴포넌트 (SRP)
 * 회원가입 2단계의 타이틀과 서브타이틀을 렌더링합니다.
 */
export default function Step2Header() {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>기본 프로필</Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>당신에게 맞는 완벽한 매칭을 찾아드릴게요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 63.986,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 7.995,
  },
  titleContainer: {
    height: 35.995,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subtitleContainer: {
    paddingHorizontal: 16, // Approx to balance Container/Header/SubTitle spacing
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#99A1AF',
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
