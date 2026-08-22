import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useRecommendationsQuery } from '@/src/features/home/hooks/useRecommendationsQuery';
import { useSwipeMutation } from '@/src/features/home/hooks/useSwipeMutation';
import type { Recommendation } from '@/src/types/api/home';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import DiscoveryMatchCard from './DiscoveryMatchCard';
import { shouldPrefetchNextPage } from './discoveryPagination';

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
  const { recommendations, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useRecommendationsQuery();
  const swipeMutation = useSwipeMutation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMatch = recommendations[currentIndex];

  // 남은 카드가 얼마 없으면 다 소진되기 전에 다음 페이지를 미리 당겨온다
  useEffect(() => {
    if (shouldPrefetchNextPage({ currentIndex, loadedCount: recommendations.length, hasNextPage, isFetchingNextPage })) {
      fetchNextPage();
    }
  }, [currentIndex, recommendations.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePass = (userUuid: string) => {
    onPass?.(userUuid);
    // 낙관적 진행 — 스와이프 응답을 기다리지 않고 바로 다음 카드로 넘어간다
    swipeMutation.mutate(userUuid);
    setCurrentIndex((prev) => prev + 1);
  };

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
      <View
        style={[styles.statusBox, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      >
        <Feather name="users" size={28} color={colors.text.muted} />
        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>추천할 상대가 아직 없어요</Text>
        <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
          탐색 지역을 넓혀보거나 잠시 후 다시 확인해주세요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View key={currentMatch.userUuid} entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
        <DiscoveryMatchCard
          match={currentMatch}
          onPass={handlePass}
          onConnect={onConnect}
          onOpenDetail={onOpenDetail}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
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
});
