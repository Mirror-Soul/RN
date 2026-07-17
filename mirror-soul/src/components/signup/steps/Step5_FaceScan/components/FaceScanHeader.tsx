import {Colors, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface FaceScanHeaderProps {
  /** 스캔 중 방향 안내 메시지 (없으면 기본 서브타이틀) */
  guideMessage?: string;
}

export default function FaceScanHeader({ guideMessage }: FaceScanHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>나의 아바타 만들기</Text>
      <Text style={styles.subTitle}>
        {guideMessage ?? '얼굴을 화면에 알맞게 위치시켜주세요.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center', // Figma has align-items: flex-start in parent, but text-align: center. I will use 'center' to match text alignment.
    gap: Spacing.sm,
  },
  title: {
    color: Colors.neutral.pureWhite,
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: 30,
    fontWeight: FontWeight.medium,
    lineHeight: 36,
    letterSpacing: 0.396,
  },
  subTitle: {
    color: Colors.neutral.lightGray,
    textAlign: 'center',
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    letterSpacing: -0.15,
    paddingHorizontal: 71,
  },
});
