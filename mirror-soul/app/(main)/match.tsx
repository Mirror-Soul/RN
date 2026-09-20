import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import {Layout, Radii, Spacing} from '@/src/constants/theme';
import Animated, { FadeInUp, FadeIn, FadeOut, useAnimatedReaction, runOnJS } from 'react-native-reanimated';

import { useTrackScroll } from '@/src/animations/scroll/useTrackScroll';
import { useLayout } from '@/src/hooks/useLayout';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useReceivedMeetingRequestsQuery } from '@/src/features/match/hooks/useReceivedMeetingRequestsQuery';
import { useRejectMeetingRequestMutation } from '@/src/features/match/hooks/useRejectMeetingRequestMutation';
import { useAcceptMeetingRequestMutation } from '@/src/features/match/hooks/useAcceptMeetingRequestMutation';
import { useChatRoomsQuery } from '@/src/features/chat/hooks/useChatRoomsQuery';
import MatchingHeader from '@/src/components/home/match/parts/MatchingHeader';
import MatchingActiveStatus from '@/src/components/home/match/parts/MatchingActiveStatus';
import MatchingActionButtons, { MatchingTab } from '@/src/components/home/match/parts/MatchingActionButtons';
import MatchingProfileCard from '@/src/components/home/match/parts/cards/MatchingProfileCard';
import MatchingCarouselIndicator from '@/src/components/home/match/parts/MatchingCarouselIndicator';
import MatchingChatList from '@/src/components/home/match/parts/MatchingChatList';
import MatchingFooter from '@/src/components/home/match/parts/MatchingFooter';
import MatchingTabStatus from '@/src/components/home/match/parts/MatchingTabStatus';

export default function MatchScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const router = useRouter();
  // contentWidth: 태블릿에서도 카드가 화면 전체 폭까지 늘어나지 않도록 다른 화면과 같은 캡을 공유한다.
  const { contentWidth, contentContainerStyle } = useLayout();

  // 전역 스크롤 트래킹 훅 사용
  const { scrollX, scrollHandler } = useTrackScroll();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<MatchingTab>('meet');

  // 카드 폭(contentWidth) 기준 400을 레퍼런스로 스케일링 — 폰에서는 기존과 동일한 값.
  const horizontalPadding = (contentWidth * 24) / 400;

  const { data, isLoading, isError, refetch } = useReceivedMeetingRequestsQuery();
  const requests = data?.requests ?? [];

  const rejectMutation = useRejectMeetingRequestMutation();
  const acceptMutation = useAcceptMeetingRequestMutation();
  const isResponding = rejectMutation.isPending || acceptMutation.isPending;

  // 캐러셀에서 현재 중앙에 있는 카드의 인덱스 — 푸터(SKIP/CHAT/TWIN CALL)가 어떤 카드를
  // 대상으로 동작해야 하는지는 이 값으로만 판단한다(카드마다 개별 푸터를 두지 않음).
  const [activeIndex, setActiveIndex] = useState(0);
  useAnimatedReaction(
    () => {
      if (requests.length === 0) return 0;
      const raw = Math.round(scrollX.value / contentWidth);
      return Math.min(Math.max(raw, 0), requests.length - 1);
    },
    (index, prevIndex) => {
      if (index !== prevIndex) {
        runOnJS(setActiveIndex)(index);
      }
    },
    [requests.length, contentWidth]
  );

  // 수락/거절로 목록이 줄어들어 activeIndex가 범위를 벗어나면 마지막 카드로 되돌린다.
  useEffect(() => {
    if (requests.length > 0 && activeIndex >= requests.length) {
      setActiveIndex(requests.length - 1);
    }
  }, [requests.length, activeIndex]);

  const activeRequest = requests[activeIndex];

  // 메시지방 탭 배지용 — 목록 자체는 MatchingChatList가 따로 조회하지만, react-query가
  // 같은 쿼리키(['chat','rooms'])를 캐시 공유하므로 여기서 또 불러도 중복 요청은 없다.
  const { data: chatRoomsData } = useChatRoomsQuery();
  const totalUnreadCount = (chatRoomsData?.rooms ?? []).reduce((sum, room) => sum + room.unreadCount, 0);

  const handleSkip = () => {
    if (!activeRequest) return;
    rejectMutation.mutate(activeRequest.requestId, {
      onError: (error) => Alert.alert('거절 실패', getErrorDisplayMessage(error, '만남 신청을 거절하지 못했습니다.')),
    });
  };

  const handleChat = () => {
    if (!activeRequest) return;
    acceptMutation.mutate(activeRequest.requestId, {
      // app/chat/[id].tsx가 이제 실제 데이터 기반이라(Phase 3-D) 응답이 돌려주는 chatRoomId로
      // 바로 그 방에 딥링크한다. 메시지방 탭도 같이 전환해둬서 뒤로가기 시 그 탭에 남아있게 한다.
      onSuccess: (response) => {
        setActiveTab('chat');
        router.push(`/chat/${response.result.chatRoomId}`);
      },
      onError: (error) => Alert.alert('수락 실패', getErrorDisplayMessage(error, '만남 신청을 수락하지 못했습니다.')),
    });
  };

  const handleCall = () => {
    if (!activeRequest) return;
    router.push({ pathname: '/ai-call', params: { targetUuid: activeRequest.senderUserUuid } });
  };

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
        <View style={contentContainerStyle}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.container}>
            <View style={{ paddingHorizontal: horizontalPadding }}>
              <MatchingHeader />
              <MatchingActiveStatus />
              <MatchingActionButtons activeTab={activeTab} onChangeTab={setActiveTab} unreadCount={totalUnreadCount} />
            </View>
          </Animated.View>

          {/* 조건부 렌더링 (Cross-fade 애니메이션) */}
          {activeTab === 'meet' ? (
            <Animated.View key="meet-tab" entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)}>
              {isLoading ? (
                <View style={{ paddingHorizontal: horizontalPadding }}>
                  <MatchingTabStatus isLoading message="불러오는 중" />
                </View>
              ) : isError && !data ? (
                // isError만 보면 캐시된 데이터가 있어도 백그라운드 재조회 실패(포커스 복귀 등)
                // 때마다 전체 오류 화면으로 덮인다 — 데이터가 없을 때만 전체 오류로 처리한다.
                <View style={{ paddingHorizontal: horizontalPadding }}>
                  <MatchingTabStatus message="만남 신청 목록을 불러오지 못했습니다" onRetry={refetch} />
                </View>
              ) : requests.length === 0 ? (
                <View style={{ paddingHorizontal: horizontalPadding }}>
                  <MatchingTabStatus message="아직 받은 만남 신청이 없어요" />
                </View>
              ) : (
                <>
                  {/* Carousel Swipe Indicator */}
                  <MatchingCarouselIndicator data={requests} scrollX={scrollX} itemWidth={contentWidth} />

                  {/* Swipeable Profile Cards */}
                  <Animated.FlatList
                    data={requests}
                    keyExtractor={(item) => String(item.requestId)}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    decelerationRate="fast"
                    snapToInterval={contentWidth}
                    contentContainerStyle={{ alignItems: 'flex-start' }}
                    renderItem={({ item, index }) => (
                      <View style={{ width: contentWidth, paddingHorizontal: horizontalPadding }}>
                        <MatchingProfileCard data={item} index={index} scrollX={scrollX} itemWidth={contentWidth} />
                      </View>
                    )}
                  />

                  {/* 카드 밖으로 분리된 단일 푸터 — activeIndex가 가리키는 카드를 대상으로 동작한다 */}
                  <View style={{ paddingHorizontal: horizontalPadding }}>
                    <MatchingFooter onSkip={handleSkip} onChat={handleChat} onCall={handleCall} isResponding={isResponding} />
                  </View>
                </>
              )}
            </Animated.View>
          ) : (
            <Animated.View key="chat-tab" entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={{ paddingHorizontal: horizontalPadding }}>
              <MatchingChatList />
            </Animated.View>
          )}
        </View>
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
