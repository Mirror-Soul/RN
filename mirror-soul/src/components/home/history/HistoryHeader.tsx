import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { tabHeaderStyles } from '@/src/components/home/common/tabHeaderStyles';

/**
 * HistoryHeader 컴포넌트 (SRP)
 * 발견/성장 탭과 동일한 3-slot 레이아웃(44px 대칭 슬롯)은 유지하되, 프로필/설정 아이콘
 * 자체는 렌더링하지 않는다 — 프로필 이동은 다른 탭과 중복이었고, 설정 버튼은 앱 전체에
 * 아직 실제 설정 화면이 없어 어느 탭에서도 죽은 버튼이었다(2026-08-17).
 * 양옆은 MatchingHeader와 동일한 방식(44px 빈 슬롯)으로 비워, 타이틀 중앙정렬과 헤더
 * 높이를 다른 탭 헤더와 그대로 맞춘다.
 */
export default function HistoryHeader() {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.iconSlot} />
      <Text style={[styles.title, { color: colors.text.primary }]}>History</Text>
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
