import MainHeader from '@/src/components/home/main/MainHeader';
import RecommendSection from '@/src/components/home/main/Recommend/RecommendSection';
import SearchLocationBar from '@/src/components/home/main/SearchLocationBar';
import UserProfileCard from '@/src/components/home/main/UserProfileCard';
import UserProfileCardSkeleton from '@/src/components/home/main/UserProfileCardSkeleton';
import { Colors, Layout } from '@/src/constants/theme';
import { logout } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { logger } from '@/src/utils/logger';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 메인 홈 화면 (발견 탭)
 * 로그인 완료 후 진입하는 메인 대시보드입니다.
 * BottomNavbar는 (main)/_layout.tsx에서 공유로 제공됩니다.
 *
 * UX 개선:
 * - FadeInDown 진입 애니메이션: 대시보드가 아래서 위로 부드럽게 진입
 * - UserProfileCardSkeleton: 프로필 데이터 로딩 중 shimmer UI
 */
export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // 스켈레톤 → 실제 카드 전환 시뮬레이션 (추후 API 연동으로 대체)
  // TODO: useQuery 연동 시 isLoading 상태로 교체
  React.useEffect(() => {
    const timer = setTimeout(() => setIsProfileLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = useCallback(() => {
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

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 화면 진입 시 FadeInDown 애니메이션 */}
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={[styles.dashboard, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING) }]}
      >
        {/* 헤더 */}
        <MainHeader onSettingPress={handleLogout} />

        {/* 유저 프로필 카드 (스켈레톤 → 실제 카드 전환) */}
        {isProfileLoading ? (
          <UserProfileCardSkeleton />
        ) : (
          <UserProfileCard />
        )}

        {/* 지역 검색 바 */}
        <SearchLocationBar />

        {/* 추천 섹션 (좌우 스와이프 카드) */}
        <RecommendSection />
      </Animated.View>
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
