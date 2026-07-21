import { MOCK_CALL_HISTORY } from '@/src/mocks/historyMocks';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { HistoryFilterType } from './HistoryFilterRow';
import HistoryCallCard from './parts/HistoryCallCard';
import HistoryDateSectionHeader from './parts/HistoryDateSectionHeader';
import { Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { HistoryCallItemData } from './parts/HistoryCallCard';

interface HistoryListProps {
  filter: HistoryFilterType;
  searchQuery: string;
}

interface HistorySection {
  title: string;
  data: HistoryCallItemData[];
}

/**
 * 필터·검색 결과를 날짜 섹션별로 그룹핑하여 표시합니다. (SRP)
 *
 * - filter: 방향 필터 (ALL / RECEIVED / SENT)
 * - searchQuery: 이름 또는 태그 기반 텍스트 검색
 * - 결과를 dateStr 기준으로 SectionList 섹션으로 변환합니다.
 */
export default function HistoryList({ filter, searchQuery }: HistoryListProps) {
  const router = useRouter();
  const { colors } = useThemeColors();

  const sections: HistorySection[] = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    // 1) 방향 필터
    const directionFiltered = MOCK_CALL_HISTORY.filter((item) => {
      if (filter === 'ALL') return true;
      return item.direction === filter;
    });

    // 2) 텍스트 검색 필터 (이름 또는 태그)
    const searched = query
      ? directionFiltered.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.tags.some((tag) => tag.toLowerCase().includes(query)),
        )
      : directionFiltered;

    // 3) dateStr 기준으로 그룹핑 (순서 유지)
    const groupMap: Map<string, HistoryCallItemData[]> = new Map();
    for (const item of searched) {
      const key = item.dateStr;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    }

    return Array.from(groupMap.entries()).map(([title, data]) => ({ title, data }));
  }, [filter, searchQuery]);

  if (sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text.muted }]}>기록이 없습니다</Text>
      </View>
    );
  }

  return (
    <SectionList<HistoryCallItemData, HistorySection>
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <HistoryDateSectionHeader dateLabel={section.title} />
      )}
      renderItem={({ item, index }) => (
        <HistoryCallCard
          data={item}
          index={index}
          onPress={() => router.push({ pathname: '/call-detail', params: { id: item.id } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // 부모 ScrollView가 스크롤을 담당
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  separator: {
    height: Spacing.sm,
  },
  sectionSeparator: {
    height: Spacing.sm,
  },
});
