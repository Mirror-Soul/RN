import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import HistoryStatCard from './parts/HistoryStatCard';

interface HistoryStatsData {
  total: number;
  received: number;
  sent: number;
}

interface HistoryStatsRowProps {
  stats: HistoryStatsData;
}

/**
 * 3개의 통계 카드를 가로로 배치하는 Row 컴포넌트
 */
export default function HistoryStatsRow({ stats }: HistoryStatsRowProps) {
  return (
    <View style={styles.container}>
      <HistoryStatCard
        count={stats.total}
        label="전체 통화"
        countColor={Colors.neutral.pureWhite}
      />
      <HistoryStatCard
        count={stats.received}
        label="받은 통화"
        countColor={Colors.primary.electricCyan} // 00D3F3
      />
      <HistoryStatCard
        count={stats.sent}
        label="보낸 통화"
        countColor={Colors.primary.vividPurple} // C27AFF
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 8, // 카드 사이 간격. 스펙에는 구체적으로 없으나 344px 맞춰 균등 배치
  },
});
