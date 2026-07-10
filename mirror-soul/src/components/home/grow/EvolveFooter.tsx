import { Colors, Radii } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장 탭 하단 안내 카드 (SRP)
 */
export default function EvolveFooter() {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>완성도가 높을수록 좋은 이유</Text>
      <Text style={[styles.subTitle, { color: colors.text.secondary }]}>
        트윈이 나를 더 잘 이해할수록 나와 잘 맞는 사람을 찾아주고, 더 자연스러운 대화를 나눌 수 있어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: Radii.md2,
    borderWidth: 0.612,
    alignSelf: 'stretch',
    gap: 8,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  subTitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 19.5,
  },
});
