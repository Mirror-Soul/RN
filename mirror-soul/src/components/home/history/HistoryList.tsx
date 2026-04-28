import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { HistoryFilterType } from './HistoryFilterRow';
import HistoryCallCard, { HistoryCallItemData } from './parts/HistoryCallCard';

// 임시 목업 데이터
const MOCK_CALL_HISTORY: HistoryCallItemData[] = [
  {
    id: '1',
    name: '수빈',
    age: 28,
    consistencyPercent: 94,
    dateStr: '오늘',
    timeStr: '14:30',
    direction: 'SENT',
    callTypeDesc: '내가 시작한 통화',
    durationLabel: '8분 23초',
    twinMatchLabel: '상대 Twin 92%',
    tags: ['음악', '전시회', '크리에이티브'],
  },
  {
    id: '2',
    name: '지우',
    age: 26,
    consistencyPercent: 88,
    dateStr: '어제',
    timeStr: '21:15',
    direction: 'RECEIVED',
    callTypeDesc: '상대방이 시작한 통화',
    durationLabel: '12분 40초',
    twinMatchLabel: '상대 Twin 85%',
    tags: ['여행', '맛집'],
  },
];

interface HistoryListProps {
  filter: HistoryFilterType;
}

export default function HistoryList({ filter }: HistoryListProps) {
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
        renderItem={({ item }) => <HistoryCallCard data={item} />}
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
