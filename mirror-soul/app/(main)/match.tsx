import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, useWindowDimensions, FlatList } from 'react-native';
import MatchingHeader from '@/src/components/home/match/parts/MatchingHeader';
import MatchingActiveBanner from '@/src/components/home/match/parts/MatchingActiveBanner';
import MatchingSummaryRow from '@/src/components/home/match/parts/MatchingSummaryRow';
import MatchingTabIndicator from '@/src/components/home/match/parts/MatchingTabIndicator';
import MatchingCard from '@/src/components/home/match/parts/MatchingCard';
import MatchingFooter from '@/src/components/home/match/parts/MatchingFooter';

const MATCH_DATA = [
  {
    id: '1',
    name: '민주',
    age: 27,
    timeAgo: '15분 전',
    twinSatisfaction: 73,
    message: 'Twin과 대화가 정말 즐거웠어요! 직접 만나서 커피 한잔 하면서 음악 이야기 더 나누고 싶어요 😊',
    summaries: ['음악 취향이 비슷해요', '여행 이야기로 공감대 형성', '대화 스타일이 편안했어요'],
  },
  {
    id: '2',
    name: '지수',
    age: 25,
    timeAgo: '30분 전',
    twinSatisfaction: 85,
    message: '함께 전시회 보러 가실 분을 찾고 있었는데, 딱 맞는 것 같아요! 대화가 잘 통할 것 같아 기대돼요.',
    summaries: ['예술/전시 관심사 일치', '차분하고 깊이 있는 대화', '비슷한 주말 라이프스타일'],
  },
];

/**
 * 매칭 화면 (Main)
 */
export default function MatchScreen() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  // 피그마 기준 가로 패딩 적용
  const horizontalPadding = (width * 19.996) / 392.927;
  const cardWidth = width - (horizontalPadding * 2);

  // 스크롤 종료 시 인덱스 계산
  const onMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 및 상단 배너 (고정 패딩) */}
          <View style={{ paddingHorizontal: horizontalPadding, gap: 20 }}>
            <MatchingHeader />
            <MatchingActiveBanner />
            <MatchingSummaryRow />
            <MatchingTabIndicator activeIndex={activeIndex} total={MATCH_DATA.length} />
          </View>

          {/* 카드 영역 (가로 스크롤) */}
          <FlatList
            data={MATCH_DATA}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
            ItemSeparatorComponent={() => <View style={{ width: horizontalPadding * 2 }} />}
            renderItem={({ item }) => (
              <View style={{ width: cardWidth }}>
                <MatchingCard {...item} />
              </View>
            )}
            // snapToInterval을 사용하여 여백이 있는 상태에서도 페이징이 잘 작동하도록 설정
            snapToInterval={width}
            decelerationRate="fast"
            snapToAlignment="center"
          />

          {/* 푸터 (고정 패딩) */}
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <MatchingFooter />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20, // 피그마 기준 gap: 19.996px
  },
});
