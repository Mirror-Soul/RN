import DiscoverySettingsBar from '@/src/components/home/main/DiscoverySettingsBar';
import DiscoveryMatchSection from '@/src/components/home/main/Discovery/DiscoveryMatchSection';
import PartnerProfileModal from '@/src/components/home/main/Discovery/PartnerProfileModal';
import CallStartConfirmSheet, {
  CallTarget,
} from '@/src/components/call/CallStartConfirmSheet';
import MainHeader from '@/src/components/home/main/MainHeader';
import ProfileQuickActionSheet from '@/src/components/home/main/ProfileQuickActionSheet';
import MatchingActiveStatus from '@/src/components/home/match/parts/MatchingActiveStatus';
import { Layout, Radii, Spacing } from '@/src/constants/theme';
import { MAIN_ROUTES } from '@/src/constants/routes/mainRoutes';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { performLogout } from '@/src/services/authService';
import { TimeRefillBottomSheet } from '@/src/features/profile/components/TimeRefillBottomSheet';
import { usePreferredRegionQuery } from '@/src/features/home/hooks/usePreferredRegionQuery';
import type { Recommendation } from '@/src/types/api/home';
import { logger } from '@/src/utils/logger';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMainTabBottomPadding } from '@/src/hooks/useMainTabBottomPadding';
import { useMainTabScroll } from '@/src/hooks/useMainTabScroll';
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
  const bottomPadding = useMainTabBottomPadding();
  const scrollCallbacks = useMainTabScroll('index');
  const { colors } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();

  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Recommendation | null>(
    null,
  );
  const [callCandidate, setCallCandidate] = useState<Recommendation | null>(
    null,
  );

  const {
    data: preferredRegion,
    isLoading: isPreferredRegionLoading,
    isError: isPreferredRegionError,
    refetch: refetchPreferredRegion,
  } = usePreferredRegionQuery();

  const handleLogout = useCallback(() => {
    Alert.alert('로그아웃', '현재 기기에서 로그아웃 하시겠습니까?', [
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
    ]);
  }, []);

  const handleViewProfile = useCallback(() => {
    router.push(MAIN_ROUTES.PROFILE);
  }, []);

  const handleOpenSettings = useCallback(() => {
    router.push('/(main)/profile-settings');
  }, []);

  const handleConnectPress = useCallback((match: Recommendation) => {
    logger.debug('Call requested from discovery card', {
      matchId: match.userUuid,
    });
    setCallCandidate(match);
  }, []);

  const handleStartCall = useCallback(
    (match: CallTarget, isPreview: boolean, remainingSeconds?: number) => {
      setCallCandidate(null);
      setSelectedMatch(null);
      // BottomSheet의 닫힘 애니메이션을 먼저 끝내야 새 화면을 native Modal이 덮지 않는다.
      setTimeout(() => {
        router.push(
          isPreview
            ? {
                pathname: '/ai-call',
                params: { preview: 'true', targetName: match.name },
              }
            : {
                pathname: '/ai-call',
                params: {
                  targetUuid: match.userUuid,
                  targetName: match.name,
                  remainingSeconds: String(remainingSeconds ?? 0),
                },
              },
        );
      }, 280);
    },
    [],
  );

  const handleRefillFromCall = useCallback(() => {
    setCallCandidate(null);
    // 통화 확인 시트가 닫힌 뒤 충전 시트를 열어 native Modal 전환이 겹치지 않게 한다.
    setTimeout(() => setShowRefillModal(true), 280);
  }, []);

  // 목업 카드도 실제 상세 응답과 같은 로컬 fixture로 모달을 열어 UI/UX를 검토할 수 있다.
  // API를 호출하지 않는 분기는 PartnerProfileModal이 담당한다.
  const handleOpenDetail = useCallback((match: Recommendation) => {
    setSelectedMatch(match);
  }, []);

  return (
    <ScrollView
      {...scrollCallbacks}
      style={[
        styles.scrollView,
        { backgroundColor: colors.background.primary },
      ]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: bottomPadding,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[
          styles.dashboard,
          contentContainerStyle,
          {
            paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING),
            paddingLeft: screenPadding + insets.left,
            paddingRight: screenPadding + insets.right,
          },
        ]}
      >
        {/* The tab header stays aligned with the other main tabs. */}
        <View style={styles.groupSpacer}>
          <MainHeader onAvatarPress={() => setShowQuickActions(true)} />
        </View>

        <DiscoverySettingsBar
          regionName={preferredRegion?.eupmyeondongName}
          nearbyCount={preferredRegion?.includedRegionIds.length}
          isRegionLoading={isPreferredRegionLoading || (preferredRegion === undefined && !isPreferredRegionError)}
          isRegionError={isPreferredRegionError}
          onRefillPress={() => setShowRefillModal(true)}
          onRegionRetry={() => { void refetchPreferredRegion(); }}
          onRegionPress={() => router.push('/discovery-region-settings')}
        />

        {/* 그룹 3: 추천 상태/새로고침 + 카드 + 액션 푸터 */}
        <View style={[styles.group, styles.groupSpacer]}>
          <DiscoveryMatchSection
            onConnect={handleConnectPress}
            onOpenDetail={handleOpenDetail}
          />
        </View>
        <View style={[styles.preferences, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <MatchingActiveStatus compact />
        </View>
      </Animated.View>

      <TimeRefillBottomSheet
        isOpen={showRefillModal}
        onClose={() => setShowRefillModal(false)}
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
        onStartCall={handleStartCall}
      />

      <CallStartConfirmSheet
        target={callCandidate}
        isOpen={callCandidate !== null}
        onClose={() => setCallCandidate(null)}
        onStart={handleStartCall}
        onRefill={handleRefillFromCall}
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
  dashboard: { gap: Spacing.lg },
  // 그룹 내부는 좁게(12px) 붙여서 하나의 덩어리로 읽히게 한다.
  group: {
    alignSelf: 'stretch',
    gap: Spacing.md,
  },
  groupSpacer: {
    marginBottom: 0,
  },
  preferences: { borderWidth: 1, borderRadius: Radii.lg, overflow: 'hidden' },
});
