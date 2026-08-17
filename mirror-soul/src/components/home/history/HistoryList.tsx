import { useHistoryCallsQuery } from '@/src/features/history/hooks/useHistoryCallsQuery';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryFilterType } from './HistoryFilterRow';
import HistoryCallCard from './parts/HistoryCallCard';
import HistoryDateSectionHeader from './parts/HistoryDateSectionHeader';
import { Colors, Layout, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { CallHistoryResult } from '@/src/types/api/history';
import { toRelativeDateLabel } from '@/src/utils/formatHistoryDate';

interface HistoryListProps {
  filter: HistoryFilterType;
  searchQuery: string;
  ListHeaderComponent?: React.ReactElement;
}

interface HistorySection {
  title: string;
  data: CallHistoryResult[];
}

/**
 * GET /history/calls(type=ALL)를 조회해 날짜 섹션별로 표시합니다. (SRP)
 *
 * 이 SectionList가 화면의 유일한 스크롤 컨테이너입니다 — 헤더(HistoryHeader/StatsRow/FilterRow)는
 * ListHeaderComponent로 받아 함께 스크롤되게 합니다. VirtualizedList를 plain ScrollView 안에
 * scrollEnabled=false로 중첩시키지 않기 위함입니다(RN 권장 안티패턴 회피).
 *
 * - filter: 방향 필터 (ALL / RECEIVED / SENT) — 클라이언트에서 필터링(useHistoryCallsQuery 참고)
 * - searchQuery: 이름 또는 토픽 기반 텍스트 검색 — 서버에 검색 API가 없어 클라이언트에서 필터링
 * - 날짜 그룹핑은 서버가 내려주는 groups[]를 그대로 사용
 */
export default function HistoryList({ filter, searchQuery, ListHeaderComponent }: HistoryListProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const { data, isLoading, isError, refetch } = useHistoryCallsQuery();

  const sections: HistorySection[] = useMemo(() => {
    if (!data) return [];
    const query = searchQuery.toLowerCase().trim();

    return data.groups
      .map((group) => {
        const histories = group.histories.filter((item) => {
          const matchesFilter = filter === 'ALL' || item.type === filter;
          const matchesQuery =
            !query ||
            item.partner.name.toLowerCase().includes(query) ||
            item.topics.some((topic) => topic.toLowerCase().includes(query));
          return matchesFilter && matchesQuery;
        });
        return { title: toRelativeDateLabel(group.date), data: histories };
      })
      .filter((section) => section.data.length > 0);
  }, [data, filter, searchQuery]);

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color={Colors.primary.electricCyan} />
        </View>
      );
    }
    if (isError) {
      return (
        <TouchableOpacity
          style={styles.emptyContainer}
          onPress={() => refetch()}
          accessibilityRole="button"
          accessibilityLabel="통화 기록 다시 조회"
        >
          <Text style={[styles.emptyText, { color: colors.text.muted }]}>
            기록을 불러오지 못했습니다 · 탭하여 재시도
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.text.muted }]}>기록이 없습니다</Text>
      </View>
    );
  };

  return (
    <SectionList<CallHistoryResult, HistorySection>
      style={styles.list}
      sections={sections}
      keyExtractor={(item) => String(item.callId)}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      renderSectionHeader={({ section }) => (
        <HistoryDateSectionHeader dateLabel={section.title} />
      )}
      renderItem={({ item, index }) => (
        <HistoryCallCard
          data={item}
          index={index}
          onPress={() => router.push({ pathname: '/call-detail', params: { id: String(item.callId) } })}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  separator: {
    height: Spacing.sm,
  },
  sectionSeparator: {
    height: Spacing.sm,
  },
});
