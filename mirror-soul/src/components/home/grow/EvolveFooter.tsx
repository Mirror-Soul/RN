import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import React from 'react';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장 탭 하단 안내 카드 (SRP)
 * 학습 데이터 안전/개인정보 보호 안내를 렌더링합니다.
 */
export default function EvolveFooter() {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
      <View style={styles.iconWrapper}>
        <Feather name="lock" size={16} color={Colors.glass.cyan30_d3} />
      </View>
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: colors.text.muted }]}>안전과 개인정보</Text>
        <Text style={[styles.subTitle, { color: colors.text.muted }]}>
          내 목소리와 답변을 트윈 학습에 활용해요. 녹음 전에는 주변 사람의 목소리가 섞이지 않는 곳인지 확인해 주세요.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: Radii.xl,
    borderWidth: 1,
    alignSelf: 'stretch',
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radii.md2,
    backgroundColor: Colors.glass.cyan10_d3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
  },
  subTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    lineHeight: 21,
  },
});
