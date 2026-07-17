import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Colors, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

interface Props {
  title: string;
  icon?: React.ReactNode;
}

/**
 * 회원가입 각 단계 내의 섹션 제목을 렌더링하는 공통 컴포넌트
 */
export default function StepSectionTitle({ title, icon }: Props) {
  return (
    <View style={styles.container}>
      {icon}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    lineHeight: 28,
    letterSpacing: -0.439,
  }
});
