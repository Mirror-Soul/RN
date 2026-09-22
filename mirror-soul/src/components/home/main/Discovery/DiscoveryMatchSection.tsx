import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useRecommendationsQuery } from '@/src/features/home/hooks/useRecommendationsQuery';
import { useSwipeMutation } from '@/src/features/home/hooks/useSwipeMutation';
import type { Recommendation } from '@/src/types/api/home';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue } from 'react-native-reanimated';
import DiscoveryMatchCard, { SWIPE_DISTANCE_THRESHOLD } from './DiscoveryMatchCard';
import DiscoveryStackPeek from './DiscoveryStackPeek';
import { shouldPrefetchNextPage } from './discoveryPagination';
import { MOCK_RECOMMENDATIONS } from './mockRecommendations';

interface DiscoveryMatchSectionProps {
  onPass?: (userUuid: string) => void;
  onConnect?: (userUuid: string) => void;
  onOpenDetail?: (match: Recommendation) => void;
}

/**
 * DiscoveryMatchSection 컴포넌트 (SRP)
 * 추천 목록 조회 + 로컬 인덱스 진행 + 패스(스와이프) 기록을 오케스트레이션합니다.
 * 상세 모달의 열림 상태는 부모(index.tsx)가 소유합니다.
 */
export default function DiscoveryMatchSection({ onPass, onConnect, onOpenDetail }: DiscoveryMatchSectionProps) {
  const { colors } = useThemeColors();
  const { recommendations, isLoading, isFetching, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useRecommendationsQuery();
  const swipeMutation = useSwipeMutation();
  const [currentIndex, setCurrentIndex] = useState(0);
  // 같은 카드에 대한 패스 중복 실행(빠른 연속 탭)을 막는 동기 락 — swipeMutation 자체는
  // 백엔드가 멱등하게 처리해 중복 호출 비용이 없지만(useSwipeMutation.ts 참고), currentIndex는
  // 함수형 업데이터라 중복 호출 시 그대로 2 증가해 카드 한 장을 건너뛴다. 그걸 막기 위한 락이다.
  const passInFlightUuidRef = useRef<string | null>(null);
  // DiscoveryMatchCard(위 카드)와 DiscoveryStackPeek(뒤 카드)이 공유하는 드래그 값 —
  // 여기서 만들어야 다음 카드가 "위 카드를 얼마나 드래그했는지"에 실시간으로 반응할 수 있다.
  const translateX = useSharedValue(0);

  // 실제 추천이 0건일 때만(개발 빌드 한정) 카드 디자인을 눈으로 확인할 수 있도록 목업으로 대체한다.
  // 페이지네이션(다음 페이지 당겨오기)은 항상 실제 recommendations 기준으로만 판단한다.
  const usingMockData = __DEV__ && !isLoading && !isError && recommendations.length === 0;
  const displayRecommendations = usingMockData ? MOCK_RECOMMENDATIONS : recommendations;
  const currentMatch = displayRecommendations[currentIndex];
  // 카드 바로 뒤에 살짝 보이는 다음 후보 — 장식용이라 없으면(마지막 카드) 그냥 안 보여준다.
  const nextMatch = displayRecommendations[currentIndex + 1];

  // 남은 카드가 얼마 없으면 다 소진되기 전에 다음 페이지를 미리 당겨온다
  useEffect(() => {
    if (shouldPrefetchNextPage({ currentIndex, loadedCount: recommendations.length, hasNextPage, isFetchingNextPage })) {
      fetchNextPage();
    }
  }, [currentIndex, recommendations.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 카드가 바뀌면(패스로 넘어갔든, 새로고침으로 인덱스가 리셋됐든) 다음 카드의 패스는
  // 다시 눌릴 수 있어야 하므로 락을 해제한다. translateX도 같이 0으로 되돌려야 한다 —
  // 안 그러면 새로 마운트되는 카드가 이전 카드가 날아간 위치(화면 밖)에서 시작해버린다.
  useEffect(() => {
    passInFlightUuidRef.current = null;
    translateX.value = 0;
  }, [currentMatch?.userUuid, translateX]);

  const handlePass = (userUuid: string) => {
    if (passInFlightUuidRef.current === userUuid) return; // 같은 카드에 대한 중복 탭 무시
    passInFlightUuidRef.current = userUuid;

    if (userUuid.startsWith('mock-')) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    onPass?.(userUuid);
    // 낙관적 진행 — 스와이프 응답을 기다리지 않고 바로 다음 카드로 넘어간다
    swipeMutation.mutate(userUuid);
    setCurrentIndex((prev) => prev + 1);
  };

  // 왼쪽 스와이프(이전 후보로) — 순수 로컬 위치 이동이라 서버 스와이프 기록을 남기지
  // 않는다(패스 기록을 되돌리는 백엔드 API가 없기도 하고, "다시 한번 보기"일 뿐이라
  // 굳이 되돌릴 필요도 없다). 첫 번째 카드보다 더 앞으로는 못 간다.
  const handleGoBack = () => {
    if (passInFlightUuidRef.current === currentMatch?.userUuid) return;
    passInFlightUuidRef.current = currentMatch?.userUuid ?? null;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRefresh = async () => {
    // useInfiniteQuery의 refetch()는 쿼리 데이터만 갱신하고 currentIndex는 그대로 둔다.
    // 모든 카드를 소진한 뒤 새로고침하면(currentIndex가 새 배열 길이 이상) currentMatch가
    // 계속 undefined가 되어 새 추천이 와도 빈 상태에 갇히므로, 성공했을 때만 리셋한다.
    const result = await refetch();
    if (result.isSuccess) {
      setCurrentIndex(0);
    }
  };

  const refreshHeader = (
    <View style={styles.sectionHeader}>
      {usingMockData ? (
        <Text style={[styles.mockLabel, { color: colors.text.muted }]}>목업 데이터</Text>
      ) : (
        <View />
      )}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={isFetching}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="추천 목록 새로고침"
      >
        {isFetching ? (
          <ActivityIndicator size="small" color={colors.text.muted} />
        ) : (
          <Feather name="refresh-cw" size={13} color={colors.text.muted} />
        )}
        <Text style={[styles.refreshText, { color: colors.text.muted }]}>새로고침</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.statusBox, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <ActivityIndicator color={colors.text.muted} />
      </View>
    );
  }

  if (isError && recommendations.length === 0) {
    return (
      <TouchableOpacity
        style={[styles.statusBox, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        onPress={() => refetch()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="추천 목록 다시 조회"
      >
        <Feather name="alert-circle" size={28} color={colors.text.muted} />
        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>추천 목록을 불러오지 못했어요</Text>
        <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>탭해서 다시 시도해주세요.</Text>
      </TouchableOpacity>
    );
  }

  // 인덱스는 다 소진했지만 다음 페이지가 아직 도착하지 않은 짧은 구간 — 빈 상태가 아니라 로딩 상태
  if (!currentMatch && isFetchingNextPage) {
    return (
      <View style={[styles.statusBox, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <ActivityIndicator color={colors.text.muted} />
      </View>
    );
  }

  // 추천 대상이 실제로 더 없는 경우 — 빈 배열이 실제로 올 수 있다
  if (!currentMatch) {
    return (
      <View style={styles.container}>
        {refreshHeader}
        <View
          style={[styles.statusBox, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        >
          <Feather name="users" size={28} color={colors.text.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>추천할 상대가 아직 없어요</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
            탐색 지역을 넓혀보거나 잠시 후 다시 확인해주세요.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {refreshHeader}
      <View style={styles.stack}>
        {nextMatch && (
          <DiscoveryStackPeek match={nextMatch} translateX={translateX} swipeThreshold={SWIPE_DISTANCE_THRESHOLD} />
        )}
        <Animated.View key={currentMatch.userUuid} entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
          <DiscoveryMatchCard
            match={currentMatch}
            onOpenDetail={onOpenDetail}
            onPass={() => handlePass(currentMatch.userUuid)}
            onGoBack={handleGoBack}
            canGoBack={currentIndex > 0}
            onConnect={() => onConnect?.(currentMatch.userUuid)}
            translateX={translateX}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  // DiscoveryStackPeek이 absoluteFillObject로 이 컨테이너 기준으로 배치되므로
  // position:relative가 필요하다 — 실제 크기는 안쪽 카드(비절대배치)가 정해준다.
  stack: {
    position: 'relative',
  },
  statusBox: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  emptySubtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  mockLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  refreshText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
