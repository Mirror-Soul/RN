import HistoryFilterRow, { HistoryFilterType } from '@/src/components/home/history/HistoryFilterRow';
import HistoryHeader from '@/src/components/home/history/HistoryHeader';
import HistoryList from '@/src/components/home/history/HistoryList';
import HistoryStatsRow from '@/src/components/home/history/HistoryStatsRow';
import {Colors, Layout, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const [activeFilter, setActiveFilter] = useState<HistoryFilterType>('ALL');

  // 임시 통계 데이터
  const mockStats = {
    total: 5,
    received: 2,
    sent: 3,
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING }, // 네비바 높이 + 안전영역 대응
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.dashboard, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING) }]}>
        <HistoryHeader />
        
        {/* 통계 스코어보드 */}
        <HistoryStatsRow stats={mockStats} />
        
        {/* 필터 탭 */}
        <HistoryFilterRow
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        
        {/* 리스트 내역 */}
        <HistoryList filter={activeFilter} />
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
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: Spacing.md, // 각 행 사이의 간격 조정 (스펙 11.992px에 근사)
  },
});
