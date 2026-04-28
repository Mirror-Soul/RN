import { MOCK_CALL_HISTORY } from '@/src/mocks/historyMocks';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { HistoryFilterType } from './HistoryFilterRow';
import HistoryCallCard from './parts/HistoryCallCard';

interface HistoryListProps {
  filter: HistoryFilterType;
}

export default function HistoryList({ filter }: HistoryListProps) {
  const router = useRouter();

  // 필터링 로직: 표시 문자열이 아닌 도메인 데이터(direction)를 기준으로 판정
  const data = MOCK_CALL_HISTORY.filter((item) => {
    if (filter === 'ALL') return true;
    return item.direction === filter;
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryCallCard
            data={item}
            onPress={() =>
              router.push({ pathname: '/call-detail', params: { id: item.id } })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // 부모 ScrollView에 의해 스크롤됨
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },
  listContent: {
    gap: 12,
  },
});
