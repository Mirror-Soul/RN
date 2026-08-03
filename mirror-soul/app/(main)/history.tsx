import HistoryFilterRow, { HistoryFilterType } from '@/src/components/home/history/HistoryFilterRow';
import HistoryHeader from '@/src/components/home/history/HistoryHeader';
import HistoryList from '@/src/components/home/history/HistoryList';
import HistoryStatsRow from '@/src/components/home/history/HistoryStatsRow';
import { Layout, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { MOCK_WEEKLY_STATS } from '@/src/mocks/historyMocks';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();
  const [activeFilter, setActiveFilter] = useState<HistoryFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.dashboard, contentContainerStyle, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING), paddingHorizontal: screenPadding }]}>
        {/* 헤더: 아바타버튼 / History 타이틀 / 설정버튼 */}
        <HistoryHeader />

        {/* 주간 요약 통계 카드 */}
        <HistoryStatsRow stats={MOCK_WEEKLY_STATS} />

        {/* 검색 인풋 + 필터 버튼 */}
        <HistoryFilterRow
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* 날짜 섹션 그룹 리스트 */}
        <HistoryList filter={activeFilter} searchQuery={searchQuery} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  dashboard: {
    gap: Spacing.md,
  },
});
