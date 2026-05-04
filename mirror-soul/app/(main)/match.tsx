import MatchingActiveBanner from '@/src/components/home/match/parts/MatchingActiveBanner';
import MatchingCard from '@/src/components/home/match/parts/MatchingCard';
import MatchingFooter from '@/src/components/home/match/parts/MatchingFooter';
import MatchingHeader from '@/src/components/home/match/parts/MatchingHeader';
import MatchingSummaryRow from '@/src/components/home/match/parts/MatchingSummaryRow';
import MatchingTabIndicator from '@/src/components/home/match/parts/MatchingTabIndicator';
import { Colors, Layout } from '@/src/constants/theme';
import React from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = React.useState(0);

  // 피그마 기준 가로 패딩 적용
  const horizontalPadding = (width * 19.996) / 392.927;

  // 스크롤 종료 시 인덱스 계산
  const onMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* 상단 섹션: 헤더 ~ 인디케이터 (개별 패딩 적용) */}
          <View style={[styles.topSection, { paddingHorizontal: horizontalPadding }]}>
            <MatchingHeader />
            <MatchingActiveBanner />
            <MatchingSummaryRow />
            <MatchingTabIndicator activeIndex={activeIndex} total={MATCH_DATA.length} />
          </View>

          {/* 중앙 섹션: 카드 영역 (가로 스크롤 가능, 높이 가변) */}
          <View style={styles.cardSection}>
            <FlatList
              data={MATCH_DATA}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <View style={{ width: width, paddingHorizontal: horizontalPadding }}>
                  <MatchingCard {...item} />
                </View>
              )}
              snapToInterval={width}
              decelerationRate="fast"
              snapToAlignment="center"
              contentContainerStyle={{ alignItems: 'flex-start' }}
            />
          </View>

          {/* 하단 섹션: 푸터 (개별 패딩 적용) */}
          <View style={[styles.bottomSection, { paddingHorizontal: horizontalPadding }]}>
            <MatchingFooter />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    paddingTop: 16,
  },
  topSection: {
    gap: 16,
    marginBottom: 16,
  },
  cardSection: {
    marginBottom: 20,
  },
  bottomSection: {
    marginTop: 8,
  },
});
