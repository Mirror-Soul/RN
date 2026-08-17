import HistoryFilterRow, { HistoryFilterType } from '@/src/components/home/history/HistoryFilterRow';
import HistoryHeader from '@/src/components/home/history/HistoryHeader';
import HistoryList from '@/src/components/home/history/HistoryList';
import HistoryStatsRow from '@/src/components/home/history/HistoryStatsRow';
import { Layout, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();
  const [activeFilter, setActiveFilter] = useState<HistoryFilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.dashboard, contentContainerStyle, { paddingHorizontal: screenPadding }]}>
        {/* 날짜 섹션 그룹 리스트 — 화면의 유일한 스크롤 오너. 헤더/통계/필터는 ListHeaderComponent로 전달 */}
        <HistoryList
          filter={activeFilter}
          searchQuery={searchQuery}
          ListHeaderComponent={
            <View style={[styles.headerBlock, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING) }]}>
              {/* 헤더: 아바타버튼 / History 타이틀 / 설정버튼 */}
              <HistoryHeader />

              {/* 주간 요약 통계 카드 */}
              <HistoryStatsRow />

              {/* 검색 인풋 + 필터 버튼 */}
              <HistoryFilterRow
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  dashboard: {
    flex: 1,
  },
  headerBlock: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
});
