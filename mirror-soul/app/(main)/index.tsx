import MainHeader from '@/src/components/home/main/MainHeader';
import RecommendSection from '@/src/components/home/main/Recommend/RecommendSection';
import SearchLocationBar from '@/src/components/home/main/SearchLocationBar';
import UserProfileCard from '@/src/components/home/main/UserProfileCard';
import { Colors, Layout } from '@/src/constants/theme';
import { logout } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { logger } from '@/src/utils/logger';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 메인 홈 화면 (발견 탭)
 * 로그인 완료 후 진입하는 메인 대시보드입니다.
 * BottomNavbar는 (main)/_layout.tsx 에서 공유로 제공됩니다.
 */
export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();

  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "현재 기기에서 로그아웃 하시겠습니까?\n(테스트용 임시 버튼입니다)",
      [
        { text: "취소", style: "cancel" },
        {
          text: "로그아웃",
          style: "destructive",
          onPress: () => {
            // iOS Alert가 닫히는 애니메이션 도중에 네비게이션이 실행되면 씹히는 현상 방지를 위해 setTimeout 사용
            setTimeout(async () => {
              logger.debug('User clicked logout from Home Settings');
              try {
                await logout(); // (1) 서버 세션 종료 시도
              } catch (error) {
                logger.warn('Server logout failed, proceeding with local logout', error);
              } finally {
                try {
                  await useAuthStore.getState().logout(); // (2) 항상 로컬 세션 정리
                  router.replace('/');
                } catch (localError) {
                  logger.error('Local logout failed', localError);
                  Alert.alert("알림", "로그아웃 처리 중 문제가 발생했습니다.");
                }
              }
            }, 100);
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.dashboard, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING) }]}>
        {/* 헤더 */}
        <MainHeader onSettingPress={handleLogout} />

        {/* 유저 프로필 카드 */}
        <UserProfileCard />

        {/* 지역 검색 바 */}
        <SearchLocationBar />

        {/* 추천 섹션 (좌우 스와이프 카드) */}
        <RecommendSection />
      </View>
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
