import MainHeader from '@/src/components/home/main/MainHeader';
import RecommendSection from '@/src/components/home/main/Recommend/RecommendSection';
import SearchLocationBar from '@/src/components/home/main/SearchLocationBar';
import UserProfileCard from '@/src/components/home/main/UserProfileCard';
import { Colors, Layout } from '@/src/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * 메인 홈 화면 (발견 탭)
 * 로그인 완료 후 진입하는 메인 대시보드입니다.
 * BottomNavbar는 (main)/_layout.tsx 에서 공유로 제공됩니다.
 */
export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.dashboard, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING) }]}>
        {/* 헤더 */}
        <MainHeader />

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
    backgroundColor: Colors.primary.soulBlack,
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
