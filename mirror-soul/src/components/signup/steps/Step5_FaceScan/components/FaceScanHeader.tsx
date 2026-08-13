import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface FaceScanHeaderProps {
  /** 스캔 중 방향 안내 메시지 (없으면 기본 서브타이틀) */
  guideMessage?: string;
}

export default function FaceScanHeader({ guideMessage }: FaceScanHeaderProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text.primary }]}>나의 아바타 만들기</Text>
      <Text style={[styles.subTitle, { color: colors.text.secondary }]}>
        {guideMessage ?? '얼굴을 화면에 알맞게 위치시켜주세요'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 26,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.3,
  },
  subTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
  },
});
