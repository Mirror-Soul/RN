import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import {Layout, Radii, Spacing} from '@/src/constants/theme';
import Animated, { FadeInUp, FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';

import { useTrackScroll } from '@/src/animations/scroll/useTrackScroll';
import MatchingHeader from '@/src/components/home/match/parts/MatchingHeader';
import MatchingActiveStatus from '@/src/components/home/match/parts/MatchingActiveStatus';
import MatchingActionButtons, { MatchingTab } from '@/src/components/home/match/parts/MatchingActionButtons';
import MatchingProfileCard from '@/src/components/home/match/parts/cards/MatchingProfileCard';
import MatchingCarouselIndicator from '@/src/components/home/match/parts/MatchingCarouselIndicator';
import MatchingChatList from '@/src/components/home/match/parts/MatchingChatList';

const TWIN_DATA = [
  { 
    id: 't1', name: 'Sarah', age: 28, timeAgo: '12분 전', satisfaction: 94, 
    tags: ['예술적 감성', '심야 산책'], 
    message: "당신의 Twin과 대화가 정말 즐거웠어요! 직접 만나서 커피 한잔 하면서 음악 이야기 더 나누고 싶어요.", 
    summaries: ['음악 취향의 높은 일치', '여행 가치관 공유', '부드러운 대화 톤'] 
  },
  { 
    id: 't2', name: '지수', age: 25, timeAgo: '30분 전', satisfaction: 88, 
    tags: ['카페 투어', '독서'], 
    message: "서로 통하는 부분이 많아 시간 가는 줄 몰랐네요. 다음에 기회가 된다면 맛있는 저녁 함께해요!", 
    summaries: ['미식 취향 공유', '비슷한 주말 라이프스타일', '긍정적인 마인드셋'] 
  },
  { 
    id: 't3', name: 'Alex', age: 31, timeAgo: '1시간 전', satisfaction: 91, 
    tags: ['영화 감상', '수영'], 
    message: "최근에 본 영화에 대해 깊은 이야기를 나눌 수 있어서 좋았습니다.", 
    summaries: ['영화 취향 공유', '유머 코드 일치'] 
  },
];

export default function MatchScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  
  // 전역 스크롤 트래킹 훅 사용
  const { scrollX, scrollHandler } = useTrackScroll();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<MatchingTab>('meet');

  const horizontalPadding = (width * 24) / 400; 

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top', 'left', 'right']}>
      {/* Background Glow Effects (테마 연동) */}
      <View style={[styles.glowLeft, { backgroundColor: colors.glow.cyan, shadowColor: colors.glow.cyan, width: width * 1.2, height: width * 1.2, left: -width * 0.4, top: -width * 0.2 }]} />
      <View style={[styles.glowRight, { backgroundColor: colors.glow.purple, shadowColor: colors.glow.purple, width: width * 1.2, height: width * 1.2, right: -width * 0.4, bottom: width * 0.2 }]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.container}>
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <MatchingHeader />
            <MatchingActiveStatus />
            <MatchingActionButtons activeTab={activeTab} onChangeTab={setActiveTab} />
          </View>
        </Animated.View>

        {/* 조건부 렌더링 (Cross-fade 애니메이션) */}
        {activeTab === 'meet' ? (
          <Animated.View key="meet-tab" entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)}>
            {/* Carousel Swipe Indicator */}
            <MatchingCarouselIndicator data={TWIN_DATA} scrollX={scrollX} itemWidth={width} />

            {/* Swipeable Profile Cards */}
            <Animated.FlatList
              data={TWIN_DATA}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={width}
              contentContainerStyle={{ alignItems: 'flex-start' }}
              renderItem={({ item, index }) => (
                <View style={{ width: width, paddingHorizontal: horizontalPadding }}>
                  <MatchingProfileCard data={item} index={index} scrollX={scrollX} itemWidth={width} />
                </View>
              )}
            />
          </Animated.View>
        ) : (
          <Animated.View key="chat-tab" entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={{ paddingHorizontal: horizontalPadding }}>
            <MatchingChatList />
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  glowLeft: {
    position: 'absolute',
    borderRadius: Radii.full,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 100,
    elevation: 10,
    zIndex: 0,
  },
  glowRight: {
    position: 'absolute',
    borderRadius: Radii.full,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 100,
    elevation: 10,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    paddingTop: Spacing.sm,
  },
});
