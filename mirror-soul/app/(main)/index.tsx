import AiStatusTicker from '@/src/components/home/main/AiStatusTicker';
import AvailableTimeCard from '@/src/components/home/main/AvailableTimeCard';
import DiscoveryMatchSection from '@/src/components/home/main/Discovery/DiscoveryMatchSection';
import PartnerProfileModal from '@/src/components/home/main/Discovery/PartnerProfileModal';
import LocationFilterBar from '@/src/components/home/main/LocationFilterBar';
import MainHeader from '@/src/components/home/main/MainHeader';
import ProfileQuickActionSheet from '@/src/components/home/main/ProfileQuickActionSheet';
import RefillModal from '@/src/components/home/main/RefillModal';
import SoulConnectTip from '@/src/components/home/main/SoulConnectTip';
import { Layout, Spacing } from '@/src/constants/theme';
import { MAIN_ROUTES } from '@/src/constants/routes/mainRoutes';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { performLogout } from '@/src/services/authService';
import { useBuyTimeMutation } from '@/src/features/profile/hooks/useBuyTimeMutation';
import { TIME_REFILL_OPTIONS } from '@/src/features/profile/constants/timeRefillOptions';
import { usePreferredRegionQuery } from '@/src/features/home/hooks/usePreferredRegionQuery';
import { useMatchingStatus } from '@/src/features/home/hooks/useMatchingStatus';
import type { Recommendation } from '@/src/types/api/home';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { logger } from '@/src/utils/logger';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

/**
 * 메인 홈 화면 (발견 탭)
 * 로그인 완료 후 진입하는 메인 대시보드입니다.
 * BottomNavbar는 (main)/_layout.tsx에서 공유로 제공됩니다.
 *
 * 모달 상태(시간 충전 / 상대 프로필 상세)는 이 화면이 소유하고, 하위 섹션 컴포넌트들은
 * 콜백을 통해서만 상태 변경을 요청합니다 (SRP). 지역 설정은 모달이 아니라 별도 라우트
 * (`/discovery-region-settings`)로 이동합니다.
 */
export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();

  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Recommendation | null>(null);
  const buyTimeMutation = useBuyTimeMutation();
  const purchaseInFlightRef = useRef(false);
  const { showToast } = useToast();
  // MainHeader가 배지 자체 조회를 이미 하지만, AiStatusTicker도 같은 상태가 필요해 여기서도
  // 구독한다 — react-query가 쿼리키(['match','status'])를 공유하므로 중복 요청은 없다.
  const { matchingEnabled, isError: isMatchingStatusError } = useMatchingStatus();

  const {
    data: preferredRegion,
    isLoading: isPreferredRegionLoading,
    isError: isPreferredRegionError,
    refetch: refetchPreferredRegion,
  } = usePreferredRegionQuery();

  const handleLogout = useCallback(() => {
    Alert.alert(
      '로그아웃',
      '현재 기기에서 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            // iOS Alert 애니메이션이 끝난 후 실행 (씹히는 현상 방지)
            setTimeout(async () => {
              logger.debug('User clicked logout from Home quick actions');
              // performLogout이 예상치 못한 이유로 실패하더라도 로그인 화면 이동은 항상 보장한다
              try {
                await performLogout();
              } catch (localError) {
                logger.error('Local logout failed', localError);
              } finally {
                router.replace('/login');
              }
            }, 100);
          },
        },
      ],
    );
  }, []);

  const handleViewProfile = useCallback(() => {
    router.push(MAIN_ROUTES.PROFILE);
  }, []);

  const handleOpenSettings = useCallback(() => {
    router.push('/(main)/profile-settings');
  }, []);

  const handleConnectNow = useCallback((match: Recommendation) => {
    // TODO: 실제 통화 연결 라우트가 정해지면 router.push로 교체
    logger.debug('Call now pressed', { matchId: match.userUuid });
    Alert.alert('안내', '통화하기 기능은 곧 제공될 예정입니다.');
    setSelectedMatch(null);
  }, []);

  const handleConnectPress = useCallback((id: string) => {
    // TODO: 실제 통화 연결 라우트가 정해지면 router.push로 교체
    logger.debug('Call pressed', { id });
    Alert.alert('안내', '통화하기 기능은 곧 제공될 예정입니다.');
  }, []);

  // 목업 카드(userUuid가 'mock-'로 시작)는 상세 조회 API가 없으므로 모달을 열지 않고 안내만 한다.
  const handleOpenDetail = useCallback((match: Recommendation) => {
    if (match.userUuid.startsWith('mock-')) {
      showToast('목업 데이터에는 상세 정보가 없어요.', 'info');
      return;
    }
    setSelectedMatch(match);
  }, [showToast]);

  const handleSelectPackage = useCallback(async (pkgId: string) => {
    // isPending은 리렌더 이후에나 반영되므로, 연속 탭에 의한 중복 결제를 막으려면 동기 락이 필요하다.
    if (purchaseInFlightRef.current) return;
    const option = TIME_REFILL_OPTIONS.find((o) => o.id === pkgId);
    if (!option) return;

    purchaseInFlightRef.current = true;
    try {
      await buyTimeMutation.mutateAsync(option.seconds);
      setShowRefillModal(false);
    } catch (error) {
      logger.error('handleSelectPackage: buyTime failed', error);
      showToast(getErrorDisplayMessage(error, '시간 충전에 실패했습니다. 잠시 후 다시 시도해주세요.'), 'error');
    } finally {
      purchaseInFlightRef.current = false;
    }
  }, [buyTimeMutation, showToast]);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[styles.dashboard, contentContainerStyle, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING), paddingHorizontal: screenPadding }]}
      >
        {/* 그룹 1: 헤더(매칭 상태 배지 포함) */}
        <View style={styles.groupSpacer}>
          <MainHeader onAvatarPress={() => setShowQuickActions(true)} />
        </View>

        {/* 그룹 2: 내 계정/탐색 설정 — 시간충전 + 지역설정. 바로 아래(그룹3과의 경계)만
            다른 그룹 경계보다 조금 좁게 둬서 "탐색 지역 아래 간격이 넓다"는 지적을 반영한다. */}
        <View style={[styles.group, styles.groupAccountSpacer]}>
          <AvailableTimeCard onRefillPress={() => setShowRefillModal(true)} />

          <LocationFilterBar
            // TODO(UI 단계): "OO동과 근처 N개 동" 형태의 요약 텍스트로 교체 예정 — 지금은 앵커 이름만 표시
            selectedLocations={preferredRegion ? [preferredRegion.eupmyeondongName] : []}
            isLoading={isPreferredRegionLoading}
            isError={isPreferredRegionError}
            onRetry={() => refetchPreferredRegion()}
            onPress={() => router.push('/discovery-region-settings')}
          />
        </View>

        {/* 그룹 3: 추천 카드 + 액션 푸터(DiscoveryMatchSection 내부에서 함께 렌더링) */}
        <View style={[styles.group, styles.groupSpacer]}>
          <AiStatusTicker isMatchingEnabled={matchingEnabled} isError={isMatchingStatusError} />

          <DiscoveryMatchSection
            onConnect={handleConnectPress}
            onOpenDetail={handleOpenDetail}
          />
        </View>

        {/* 그룹 4: 하단 정보 카드 */}
        <SoulConnectTip />
      </Animated.View>

      <RefillModal
        visible={showRefillModal}
        onClose={() => setShowRefillModal(false)}
        onSelectPackage={handleSelectPackage}
      />

      <ProfileQuickActionSheet
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        onViewProfile={handleViewProfile}
        onOpenSettings={handleOpenSettings}
        onLogout={handleLogout}
      />

      <PartnerProfileModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onConnectNow={handleConnectNow}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 140, // Floating BottomNavbar 높이만큼 여유 공간 확보
  },
  // 그룹별로 아래쪽 간격이 서로 달라(그룹2만 더 좁게) 균일 gap 대신 그룹마다
  // marginBottom을 개별로 준다 — 마지막 그룹(SoulConnectTip)은 여백이 필요 없다.
  dashboard: {},
  // 그룹 내부는 좁게(12px) 붙여서 하나의 덩어리로 읽히게 한다.
  group: {
    alignSelf: 'stretch',
    gap: Spacing.md,
  },
  groupSpacer: {
    marginBottom: Layout.SCREEN_PADDING,
  },
  // 탐색 지역 바로 아래(그룹2→그룹3 경계)만 기본 간격(24px)보다 조금 좁게(20px).
  groupAccountSpacer: {
    marginBottom: Spacing.xl,
  },
});
