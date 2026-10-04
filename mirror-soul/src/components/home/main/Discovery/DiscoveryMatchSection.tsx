import { Feather } from '@expo/vector-icons';
import {
  FontFamily,
  FontSize,
  FontWeight,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useRecommendationsQuery } from '@/src/features/home/hooks/useRecommendationsQuery';
import { useSwipeMutation } from '@/src/features/home/hooks/useSwipeMutation';
import type { Recommendation } from '@/src/types/api/home';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
} from 'react-native-reanimated';
import DiscoveryMatchCard, { SWIPE_DISTANCE_RATIO } from './DiscoveryMatchCard';
import DiscoveryStackPeek from './DiscoveryStackPeek';
import { shouldPrefetchNextPage } from './discoveryPagination';
import { MOCK_RECOMMENDATIONS } from './mockRecommendations';
import { useRefreshCooldown } from './useRefreshCooldown';
import AiStatusTicker from '../AiStatusTicker';

interface DiscoveryMatchSectionProps {
  onPass?: (userUuid: string) => void;
  onConnect?: (match: Recommendation) => void;
  onOpenDetail?: (match: Recommendation) => void;
  isMatchingEnabled?: boolean | null;
  isMatchingStatusError?: boolean;
}

/**
 * DiscoveryMatchSection 컴포넌트 (SRP)
 * 추천 목록 조회 + 로컬 인덱스 진행 + 패스(스와이프) 기록을 오케스트레이션합니다.
 * 상세 모달의 열림 상태는 부모(index.tsx)가 소유합니다.
 */
export default function DiscoveryMatchSection({
  onPass,
  onConnect,
  onOpenDetail,
  isMatchingEnabled,
  isMatchingStatusError,
}: DiscoveryMatchSectionProps) {
  const { colors } = useThemeColors();
  const { width } = useWindowDimensions();
  const {
    recommendations,
    isLoading,
    isFetching,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useRecommendationsQuery();
  const swipeMutation = useSwipeMutation();
  const { isInCooldown, startCooldown } = useRefreshCooldown();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const refreshLock = useRef(false);
  const nextPageLock = useRef(false);
  // 같은 카드에 대한 패스 중복 실행(빠른 연속 탭)을 막는 동기 락 — swipeMutation 자체는
  // 백엔드가 멱등하게 처리해 중복 호출 비용이 없지만(useSwipeMutation.ts 참고), currentIndex는
  // 함수형 업데이터라 중복 호출 시 그대로 2 증가해 카드 한 장을 건너뛴다. 그걸 막기 위한 락이다.
  const passInFlightUuidRef = useRef<string | null>(null);
  // DiscoveryMatchCard(위 카드)와 DiscoveryStackPeek(뒤 카드)이 공유하는 드래그 값 —
  // 여기서 만들어야 다음 카드가 "위 카드를 얼마나 드래그했는지"에 실시간으로 반응할 수 있다.
  const translateX = useSharedValue(0);

  // 실제 추천이 0건일 때만(개발 빌드 한정) 카드 디자인을 눈으로 확인할 수 있도록 목업으로 대체한다.
  // 페이지네이션(다음 페이지 당겨오기)은 항상 실제 recommendations 기준으로만 판단한다.
  const usingMockData =
    __DEV__ &&
    showExamples &&
    !isLoading &&
    !isError &&
    recommendations.length === 0;
  const displayRecommendations = usingMockData
    ? MOCK_RECOMMENDATIONS
    : recommendations;
  const currentMatch = displayRecommendations[currentIndex];
  const displayedUuidRef = useRef<string | undefined>(undefined);
  displayedUuidRef.current = currentMatch?.userUuid;
  // 카드 바로 뒤에 살짝 보이는 다음 후보 — 장식용이라 없으면(마지막 카드) 그냥 안 보여준다.
  const nextMatch = displayRecommendations[currentIndex + 1];

  // 남은 카드가 얼마 없으면 다 소진되기 전에 다음 페이지를 미리 당겨온다
  useEffect(() => {
    if (
      !isFetchNextPageError &&
      shouldPrefetchNextPage({
        currentIndex,
        loadedCount: recommendations.length,
        hasNextPage,
        isFetchingNextPage,
      })
    ) {
      fetchNextPage();
    }
  }, [
    currentIndex,
    recommendations.length,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  ]);

  // 카드가 바뀌면(패스로 넘어갔든, 새로고침으로 인덱스가 리셋됐든) 다음 카드의 패스는
  // 다시 눌릴 수 있어야 하므로 락을 해제한다. translateX도 같이 0으로 되돌려야 한다 —
  // 안 그러면 새로 마운트되는 카드가 이전 카드가 날아간 위치(화면 밖)에서 시작해버린다.
  useEffect(() => {
    passInFlightUuidRef.current = null;
    translateX.value = 0;
  }, [currentMatch?.userUuid, translateX]);

  const handlePass = (userUuid: string) => {
    if (displayedUuidRef.current !== userUuid) return;
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
    if (displayedUuidRef.current !== currentMatch?.userUuid) return;
    if (passInFlightUuidRef.current === currentMatch?.userUuid) return;
    passInFlightUuidRef.current = currentMatch?.userUuid ?? null;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRefresh = async () => {
    if (refreshLock.current || isInCooldown) return;
    refreshLock.current = true;
    startCooldown();
    // useInfiniteQuery의 refetch()는 쿼리 데이터만 갱신하고 currentIndex는 그대로 둔다.
    // 모든 카드를 소진한 뒤 새로고침하면(currentIndex가 새 배열 길이 이상) currentMatch가
    // 계속 undefined가 되어 새 추천이 와도 빈 상태에 갇히므로, 성공했을 때만 리셋한다.
    try {
      const result = await refetch();
      if (result.isSuccess) {
        setCurrentIndex(0);
        setShowExamples(false);
      }
    } finally {
      refreshLock.current = false;
    }
    // 성공/실패 여부와 무관하게 쿨다운 — 연타로 서버 호출이 반복되는 걸 막는 게 목적이라
    // 결과와 상관없이 방금 요청 하나가 나갔다는 사실 자체가 쿨다운 시작 조건이다.
  };

  const refreshHeader = (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeading}>
        <AiStatusTicker
          isMatchingEnabled={isMatchingEnabled}
          isError={isMatchingStatusError}
        />
        {usingMockData ? (
          <Text style={[styles.mockLabel, { color: colors.text.secondary }]}>
            디자인 예시
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={isFetching || isInCooldown}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="추천 목록 새로고침"
        accessibilityState={{
          disabled: isFetching || isInCooldown,
          busy: isFetching,
        }}
      >
        {isFetching ? (
          <ActivityIndicator size="small" color={colors.text.muted} />
        ) : (
          <Feather name="refresh-cw" size={13} color={colors.text.muted} />
        )}
        <Text style={[styles.refreshText, { color: colors.text.muted }]}>
          새로고침
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {refreshHeader}
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
          ]}
        >
          <ActivityIndicator color={colors.text.muted} />
        </View>
      </View>
    );
  }

  if (isError && recommendations.length === 0) {
    return (
      <View style={styles.container}>
        {refreshHeader}
        <TouchableOpacity
          style={[
            styles.statusBox,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
          ]}
          onPress={handleRefresh}
          disabled={isFetching || isInCooldown}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="추천 목록 다시 조회"
        >
          <Feather name="alert-circle" size={28} color={colors.text.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            추천 목록을 불러오지 못했어요
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
            탭해서 다시 시도해주세요.
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 인덱스는 다 소진했지만 다음 페이지가 아직 도착하지 않은 짧은 구간 — 빈 상태가 아니라 로딩 상태
  if (!currentMatch && isFetchingNextPage) {
    return (
      <View style={styles.container}>
        {refreshHeader}
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
          ]}
        >
          <ActivityIndicator color={colors.text.muted} />
        </View>
      </View>
    );
  }

  // 추천 대상이 실제로 더 없는 경우 — 빈 배열이 실제로 올 수 있다
  if (!currentMatch) {
    return (
      <View style={styles.container}>
        {refreshHeader}
        <View
          style={[
            styles.statusBox,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
          ]}
        >
          <Feather name="users" size={28} color={colors.text.muted} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            {isFetchNextPageError
              ? '다음 프로필을 불러오지 못했어요'
              : '추천할 상대가 아직 없어요'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
            {isFetchNextPageError
              ? '연결 상태를 확인하고 다시 시도해 주세요.'
              : '탐색 지역을 넓히거나 나중에 다시 확인해 주세요.'}
          </Text>
          {isFetchNextPageError && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="다음 프로필 다시 불러오기"
              onPress={async () => {
                if (nextPageLock.current || isFetchingNextPage) return;
                nextPageLock.current = true;
                try {
                  await fetchNextPage();
                } finally {
                  nextPageLock.current = false;
                }
              }}
              style={styles.navigationButton}
            >
              <Text
                style={[styles.navigationText, { color: colors.brand.accent }]}
              >
                다시 불러오기
              </Text>
            </TouchableOpacity>
          )}
          {__DEV__ && !isFetchNextPageError && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="개발용 디자인 예시 보기"
              onPress={() => {
                setCurrentIndex(0);
                setShowExamples(true);
              }}
              style={styles.navigationButton}
            >
              <Text
                style={[styles.mockLabel, { color: colors.text.secondary }]}
              >
                개발용 디자인 예시 보기
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {refreshHeader}
      <View style={styles.stack}>
        {nextMatch && (
          <DiscoveryStackPeek
            match={nextMatch}
            translateX={translateX}
            swipeThreshold={width * SWIPE_DISTANCE_RATIO}
          />
        )}
        <Animated.View
          key={currentMatch.userUuid}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <DiscoveryMatchCard
            match={currentMatch}
            onOpenDetail={onOpenDetail}
            onPass={() => handlePass(currentMatch.userUuid)}
            onGoBack={handleGoBack}
            canGoBack={currentIndex > 0}
            onConnect={() => onConnect?.(currentMatch)}
            translateX={translateX}
          />
        </Animated.View>
      </View>
      <View style={styles.navigation}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="이전 프로필"
          accessibilityState={{ disabled: currentIndex === 0 }}
          disabled={currentIndex === 0}
          onPress={handleGoBack}
          style={[
            styles.navigationButton,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
            currentIndex === 0 && { opacity: 0.4 },
          ]}
        >
          <Feather
            name="chevron-left"
            size={18}
            color={colors.text.secondary}
          />
          <Text
            style={[styles.navigationText, { color: colors.text.secondary }]}
          >
            이전
          </Text>
        </TouchableOpacity>
        <Text style={[styles.position, { color: colors.text.secondary }]}>
          {currentIndex + 1}번째 프로필
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="다음 프로필"
          onPress={() => handlePass(currentMatch.userUuid)}
          style={[
            styles.navigationButton,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.primary,
            },
          ]}
        >
          <Text
            style={[styles.navigationText, { color: colors.text.secondary }]}
          >
            다음
          </Text>
          <Feather
            name="chevron-right"
            size={18}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
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
    minHeight: 220,
    paddingVertical: Spacing.xxxl,
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
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionHeaderLeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mockLabel: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  refreshButton: {
    minHeight: 48,
    minWidth: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  refreshText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  navigation: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navigationButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.full,
  },
  navigationText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    lineHeight: 22,
    fontWeight: FontWeight.medium,
  },
  position: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
});
