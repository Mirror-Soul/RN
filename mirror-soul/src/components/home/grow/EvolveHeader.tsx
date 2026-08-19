import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { tabHeaderStyles } from '@/src/components/home/common/tabHeaderStyles';

/**
 * 성장 탭 헤더 (SRP)
 * History 탭과 동일한 이유로 프로필/설정 아이콘을 렌더링하지 않는다 — 프로필 이동은
 * 하단 탭바와 중복이고, 설정 버튼은 이 탭에 실제 연결된 화면이 없어 죽은 버튼이었다.
 * 양옆은 44px 빈 슬롯으로 남겨 타이틀 중앙정렬과 헤더 높이를 다른 탭과 동일하게 맞춘다.
 */
export default function EvolveHeader() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.iconSlot} />
      <Text style={[styles.title, { color: colors.text.primary }]}>Growth</Text>
      <View style={styles.iconSlot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: tabHeaderStyles.container,
  title: tabHeaderStyles.title,
  iconSlot: {
    width: 44,
    height: 44,
  },
});
