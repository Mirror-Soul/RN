import AiStatusTicker from '@/src/components/home/main/AiStatusTicker';
import AvailableTimeCard from '@/src/components/home/main/AvailableTimeCard';
import DiscoveryMatchSection from '@/src/components/home/main/Discovery/DiscoveryMatchSection';
import PartnerProfileModal from '@/src/components/home/main/Discovery/PartnerProfileModal';
import { SoulMatch } from '@/src/components/home/main/Discovery/DiscoveryMatchCard';
import LocationFilterBar from '@/src/components/home/main/LocationFilterBar';
import LocationSelectModal from '@/src/components/home/main/LocationSelectModal';
import MainHeader from '@/src/components/home/main/MainHeader';
import RefillModal from '@/src/components/home/main/RefillModal';
import SoulConnectTip from '@/src/components/home/main/SoulConnectTip';
import { Layout } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { logout } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { logger } from '@/src/utils/logger';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

/**
 * 메인 홈 화면 (발견 탭)
 * 로그인 완료 후 진입하는 메인 대시보드입니다.
 * BottomNavbar는 (main)/_layout.tsx에서 공유로 제공됩니다.
 *
 * 모달 상태(지역 설정 / 시간 충전 / 상대 프로필 상세)는 이 화면이 소유하고,
 * 하위 섹션 컴포넌트들은 콜백을 통해서만 상태 변경을 요청합니다 (SRP).
 */
export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['강남구']);
  const [selectedMatch, setSelectedMatch] = useState<SoulMatch | null>(null);

  const handleSettingPress = useCallback(() => {
    Alert.alert(
      '로그아웃',
      '현재 기기에서 로그아웃 하시겠습니까?\n(테스트용 임시 버튼입니다)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            // iOS Alert 애니메이션이 끝난 후 실행 (씹히는 현상 방지)
            setTimeout(async () => {
              logger.debug('User clicked logout from Home Settings');
              try {
                await logout();
              } catch (error) {
                logger.warn('Server logout failed, proceeding with local logout', error);
              } finally {
                try {
                  await useAuthStore.getState().logout();
                  router.replace('/');
                } catch (localError) {
                  logger.error('Local logout failed', localError);
                  Alert.alert('알림', '로그아웃 처리 중 문제가 발생했습니다.');
                }
              }
            }, 100);
          },
        },
      ],
    );
  }, []);

  const handleConnectNow = useCallback((match: SoulMatch) => {
    // TODO: 실제 통화/채팅 연결 라우트가 정해지면 router.push로 교체
    logger.debug('Connect Now pressed', { matchId: match.id });
    Alert.alert('안내', 'Soul Connect 기능은 곧 제공될 예정입니다.');
    setSelectedMatch(null);
  }, []);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={[styles.dashboard, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING) }]}
      >
        <MainHeader onSettingPress={handleSettingPress} />

        <AvailableTimeCard onRefillPress={() => setShowRefillModal(true)} />

        <LocationFilterBar
          selectedLocations={selectedLocations}
          onPress={() => setShowLocationModal(true)}
        />

        <AiStatusTicker />

        <DiscoveryMatchSection
          onConnect={(id) => logger.debug('Soul Connect pressed', { id })}
          onOpenDetail={setSelectedMatch}
        />

        <SoulConnectTip />
      </Animated.View>

      <LocationSelectModal
        visible={showLocationModal}
        initialSelected={selectedLocations}
        onClose={() => setShowLocationModal(false)}
        onConfirm={setSelectedLocations}
      />

      <RefillModal visible={showRefillModal} onClose={() => setShowRefillModal(false)} />

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
  dashboard: {
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: Layout.SCREEN_PADDING,
  },
});
