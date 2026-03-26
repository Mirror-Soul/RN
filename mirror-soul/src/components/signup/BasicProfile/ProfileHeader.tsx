import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface ProfileHeaderProps {
  title: string;
  subtitle: string;
}

/**
 * Basic Profile 등 타이틀과 캡션이 들어가는 헤더 공통 컴포넌트
 */
export default function ProfileHeader({ title, subtitle }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
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
  title: {
    color: Colors.neutral.pureWhite,
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subtitle: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  }
});
