import { Colors } from '@/src/constants/theme';
import React, { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ViewToken } from 'react-native';
import RecommendCard, { RecommendCardData } from './RecommendCard';
import RecommendStepIndicator from '../RecommendStepIndicator';
import { useLayout } from '@/src/hooks/useLayout';

// Mock 데이터 — 추후 API 연동 시 교체
const MOCK_CARDS: RecommendCardData[] = [
  {
    id: '1',
    name: '서연',
    age: 28,
    location: '서울 강남구',
    description: '책과 음악을 사랑하는 크리에이티브 디렉터입니다. 주말에는 카페에서 책을 읽거나 전시회를 다니며 영감을 얻고 있어요. 깊이 있는 대화와 새로운 경험을 좋아합니다.',
    similarityPercent: 94,
  },
  {
    id: '2',
    name: '지우',
    age: 26,
    location: '서울 마포구',
    description: '데이터 사이언티스트로 일하며 여행과 맛집 탐방을 즐깁니다. 새로운 사람을 만나고 이야기 나누는 걸 좋아해요.',
    similarityPercent: 88,
  },
  {
    id: '3',
    name: '민준',
    age: 30,
    location: '서울 송파구',
    description: '스타트업에서 일하는 개발자입니다. 주말엔 등산이나 러닝으로 체력을 키우고 있어요.',
    similarityPercent: 82,
  },
  {
    id: '4',
    name: '하은',
    age: 27,
    location: '서울 서초구',
    description: '디자이너입니다. 음악 페스티벌과 전시 관람을 즐기며 일상 속 작은 행복을 찾는 편이에요.',
    similarityPercent: 79,
  },
  {
    id: '5',
    name: '태양',
    age: 31,
    location: '서울 강북구',
    description: '건축 사무소에서 일합니다. 도시와 공간에 관심이 많고 사진 찍는 걸 즐깁니다.',
    similarityPercent: 75,
  },
];

interface RecommendSectionProps {
  onViewAll?: () => void;
  onPass?: (id: string) => void;
  onLike?: (id: string) => void;
  onInfo?: (id: string) => void;
}

/**
 * RecommendSection 컴포넌트 (SRP)
 * 추천 헤딩, "전체 보기" 버튼, 좌우 스와이프 카드 목록,
 * 페이지 인디케이터를 조합하는 오케스트레이터입니다.
 */
export default function RecommendSection({
  onViewAll,
  onPass,
  onLike,
  onInfo,
}: RecommendSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { contentWidth } = useLayout();

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      {/* 헤딩 + 전체 보기 */}
      <View style={styles.header}>
        <Text style={styles.heading}>추천</Text>
        <TouchableOpacity
          onPress={onViewAll}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="추천 전체 보기"
        >
          <Text style={styles.viewAllText}>전체 보기</Text>
        </TouchableOpacity>
      </View>

      {/* 좌우 스와이프 카드 리스트 */}
      <FlatList
        data={MOCK_CARDS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.cardWrapper, { width: contentWidth }]}>
            <RecommendCard
              data={item}
              onPass={onPass}
              onLike={onLike}
              onInfo={onInfo}
            />
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToAlignment="start"
        decelerationRate="fast"
      />

      {/* 페이지 인디케이터 */}
      <RecommendStepIndicator
        total={MOCK_CARDS.length}
        activeIndex={activeIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 30,
  },
  heading: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 30,
    letterSpacing: -0.449,
  },
  viewAllText: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  cardWrapper: {
    paddingRight: 0,
  },
});
