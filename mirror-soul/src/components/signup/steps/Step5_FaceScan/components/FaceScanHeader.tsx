import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface FaceScanHeaderProps {
  /** 스캔 중 방향 안내 메시지 (없으면 기본 서브타이틀) */
  guideMessage?: string;
}

export default function FaceScanHeader({ guideMessage }: FaceScanHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>3D Face Scan</Text>
      <Text style={styles.subTitle}>
        {guideMessage ?? 'Position your face in the center'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center', // Figma has align-items: flex-start in parent, but text-align: center. I will use 'center' to match text alignment.
    gap: 8,
  },
  title: {
    color: Colors.neutral.pureWhite,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subTitle: {
    color: Colors.neutral.lightGray,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
    paddingHorizontal: 71,
  },
});
