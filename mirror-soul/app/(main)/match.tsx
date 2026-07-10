import MatchingMeetCard from '@/src/components/home/match/parts/cards/MatchingMeetCard';
import MatchingRecommendCard from '@/src/components/home/match/parts/cards/MatchingRecommendCard';
import MatchingTwinCard from '@/src/components/home/match/parts/cards/MatchingTwinCard';
import MatchingActiveBanner from '@/src/components/home/match/parts/MatchingActiveBanner';
import MatchingFooter from '@/src/components/home/match/parts/MatchingFooter';
import MatchingHeader from '@/src/components/home/match/parts/MatchingHeader';
import MatchingSummaryRow, { MatchingTabType } from '@/src/components/home/match/parts/MatchingSummaryRow';
import MatchingTabIndicator from '@/src/components/home/match/parts/MatchingTabIndicator';
import { Colors, Layout } from '@/src/constants/theme';
import React from 'react';
import { Animated as RNAnimated, FlatList, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const MEET_DATA = [
  {
    id: 'm1',
    name: '민주',
    age: 27,
    timeAgo: '15분 전',
    twinSatisfaction: 73,
    message: 'Twin과 대화가 정말 즐거웠어요! 직접 만나서 커피 한잔 하면서 음악 이야기 더 나누고 싶어요 😊',
    summaries: ['음악 취향이 비슷해요', '여행 이야기로 공감대 형성', '대화 스타일이 편안했어요'],
  },
  {
    id: 'm2',
    name: '지수',
    age: 25,
    timeAgo: '30분 전',
    twinSatisfaction: 85,
    message: '함께 전시회 보러 가실 분을 찾고 있었는데, 딱 맞는 것 같아요! 대화가 잘 통할 것 같아 기대돼요.',
    summaries: ['예술/전시 관심사 일치', '차분하고 깊이 있는 대화', '비슷한 주말 라이프스타일'],
  },
];

const RECOMMEND_DATA = [
  {
    id: 'r1',
    name: '지연',
    age: 23,
    bio: '요가 강사이자 명상을 좋아하는 평화로운 영혼',
    reasons: ['둘 다 웰빙과 자기계발에 관심', '조용하고 깊이 있는 대화 선호', '비슷한 라이프스타일'],
    avgCallMinutes: 16,
    tags: ['헬스', '식단'],
  },
  {
    id: 'r2',
    name: '수현',
    age: 26,
    bio: 'IT 개발자이자 주말에는 밴드 활동을 하는 베이시스트',
    reasons: ['음악적 취향의 높은 일치도', '기술과 예술에 대한 공통 관심사', '활발한 대화 스타일'],
    avgCallMinutes: 24,
    tags: ['재즈', '코딩'],
  },
];

const TWIN_DATA = [
  {
    id: 't1',
    name: '정연',
    age: 31,
    callCount: 3,
    timeAgo: '5시간 전',
    twinSatisfaction: 67,
    summaries: ['여행과 사진에 열정적', '활발하고 긍정적인 에너지', '새로운 경험을 즐김'],
    summaryHighlight: '최근 여행 경험을 공유하며 즐겁게 대화했어요',
  },
  {
    id: 't2',
    name: '성훈',
    age: 29,
    callCount: 2,
    timeAgo: '2시간 전',
    twinSatisfaction: 82,
    summaries: ['카페 투어와 디저트 미식가', '조용하지만 깊이 있는 대화', '주말 아침 러닝 메이트'],
    summaryHighlight: '비슷한 주말 라이프스타일에 대해 공감하며 대화했어요',
  },
  {
    id: 't3',
    name: '다은',
    age: 26,
    callCount: 5,
    timeAgo: '12시간 전',
    twinSatisfaction: 94,
    summaries: ['반려동물과 유기견 봉사 관심', '리액션이 좋고 밝은 성격', 'IT 트렌드와 커리어 공유'],
    summaryHighlight: '가치관이 매우 유사하여 끊임없이 대화가 이어졌어요',
  },
];

/**
 * 매칭 화면 (Main)
 */
export default function MatchScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { animatedBackground } = useAnimatedTheme();
  const [activeTab, setActiveTab] = React.useState<MatchingTabType>('meet');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const fadeAnim = React.useRef(new RNAnimated.Value(1)).current;
  const flatListRef = React.useRef<FlatList>(null);

  // 피그마 기준 가로 패딩 적용
  const horizontalPadding = (width * 19.996) / 392.927;

  // 탭 전환 핸들러 (애니메이션 포함)
  const handleTabChange = (tab: MatchingTabType) => {
    if (tab === activeTab) return;

    RNAnimated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      setActiveIndex(0);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });

      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // 스크롤 종료 시 인덱스 계산
  const onMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setActiveIndex(index);
  };

  const getDataByTab = () => {
    if (activeTab === 'meet') return MEET_DATA;
    if (activeTab === 'twin') return TWIN_DATA;
    return RECOMMEND_DATA;
  };

  const getActiveColor = () => {
    if (activeTab === 'meet') return Colors.primary.mirrorOrange;
    if (activeTab === 'twin') return Colors.primary.electricCyan;
    return Colors.primary.vividPurple;
  };

  const currentData = getDataByTab();
  const activeColor = getActiveColor();

  return (
    <AnimatedSafeAreaView style={[styles.safeArea, animatedBackground]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* 상단 섹션 */}
          <View style={[styles.topSection, { paddingHorizontal: horizontalPadding }]}>
            <MatchingHeader />
            <MatchingActiveBanner />
            <MatchingSummaryRow activeTab={activeTab} onTabChange={handleTabChange} />
            <MatchingTabIndicator
              activeIndex={activeIndex}
              total={currentData.length}
              activeColor={activeColor}
            />
          </View>

          {/* 중앙 섹션 (카드 영역) */}
          <RNAnimated.View style={[styles.cardSection, { opacity: fadeAnim }]}>
            <FlatList
              ref={flatListRef}
              data={currentData}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={({ item }) => (
                <View style={{ width: width, paddingHorizontal: horizontalPadding }}>
                  {activeTab === 'meet' && <MatchingMeetCard {...item} />}
                  {activeTab === 'twin' && <MatchingTwinCard {...item} />}
                  {activeTab === 'recommend' && <MatchingRecommendCard {...item} />}
                </View>
              )}
              snapToInterval={width}
              decelerationRate="fast"
              snapToAlignment="center"
              contentContainerStyle={{ alignItems: 'flex-start' }}
            />
          </Animated.View>

          {/* 하단 섹션 */}
          <View style={[styles.bottomSection, { paddingHorizontal: horizontalPadding }]}>
            <MatchingFooter activeTab={activeTab} />
          </View>
        </View>
      </ScrollView>
    </AnimatedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
