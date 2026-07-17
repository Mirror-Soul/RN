import React from 'react';
import { StyleSheet, View } from 'react-native';
import HistoryFilterButton from './parts/HistoryFilterButton';
import { Spacing } from '@/src/constants/theme';


export type HistoryFilterType = 'ALL' | 'RECEIVED' | 'SENT';

interface HistoryFilterRowProps {
  activeFilter: HistoryFilterType;
  onFilterChange: (filter: HistoryFilterType) => void;
}

/**
 * 전체 / 받은 통화 / 보낸 통화 필터 버튼 그룹
 */
export default function HistoryFilterRow({
  activeFilter,
  onFilterChange,
}: HistoryFilterRowProps) {
  return (
    <View style={styles.container}>
      <HistoryFilterButton
        label="전체"
        isActive={activeFilter === 'ALL'}
        onPress={() => onFilterChange('ALL')}
      />
      <HistoryFilterButton
        label="받은 통화"
        isActive={activeFilter === 'RECEIVED'}
        onPress={() => onFilterChange('RECEIVED')}
      />
      <HistoryFilterButton
        label="보낸 통화"
        isActive={activeFilter === 'SENT'}
        onPress={() => onFilterChange('SENT')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: Spacing.sm, // 7.995px 반올림
  },
});
