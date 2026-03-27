import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface Props {
  title: string;
  subtitle: string;
}

/**
 * 회원가입 각 단계의 제목과 부제목을 렌더링하는 공통 헤더
 */
export default function StepHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.subtitleWrapper}>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 40,
  },
  titleWrapper: {
    width: '100%',
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subtitleWrapper: {
    width: '100%',
    flexShrink: 1,
  },
  subtitle: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});
