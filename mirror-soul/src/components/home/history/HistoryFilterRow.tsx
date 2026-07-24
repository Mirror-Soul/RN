import React from 'react';
import { StyleSheet, View } from 'react-native';
import HistoryFilterButton from './parts/HistoryFilterButton';
import HistorySearchBar from './parts/HistorySearchBar';
import { Colors, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export type HistoryFilterType = 'ALL' | 'RECEIVED' | 'SENT';

/** 필터 버튼 데이터 정의 (DRY — 레이블·타입 한 곳에서 관리) */
const FILTER_OPTIONS: { type: HistoryFilterType; label: string }[] = [
  { type: 'ALL', label: '전체' },
  { type: 'RECEIVED', label: '받음' },
  { type: 'SENT', label: '보냄' },
];

interface HistoryFilterRowProps {
  activeFilter: HistoryFilterType;
  onFilterChange: (filter: HistoryFilterType) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

/**
 * 검색 인풋 + 필터 버튼 그룹 Row (SRP)
 * SearchBar와 FilterButton들을 가로로 배치합니다.
 */
export default function HistoryFilterRow({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: HistoryFilterRowProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      {/* 검색 인풋 (flex:1로 가용 공간 확장) */}
      <HistorySearchBar value={searchQuery} onChangeText={onSearchChange} />

      {/* 필터 버튼 컨테이너 */}
      <View
        style={[
          styles.filterGroup,
          { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
        ]}
      >
        {FILTER_OPTIONS.map(({ type, label }) => (
          <HistoryFilterButton
            key={type}
            label={label}
            isActive={activeFilter === type}
            onPress={() => onFilterChange(type)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    gap: Spacing.xxs,
    height: 48,
  },
});
