import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface ProfileSectionTitleProps {
  title: string;
  icon?: React.ReactNode;
}

/**
 * Basic Profile 내의 각 섹션 제목 렌더링 컴포넌트
 */
export default function ProfileSectionTitle({ title, icon }: ProfileSectionTitleProps) {
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
    gap: 8,
    marginBottom: 16,
  },
  title: {
    color: Colors.neutral.pureWhite,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.439,
  }
});
