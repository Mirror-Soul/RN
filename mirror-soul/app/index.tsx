import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import ActionCard from '@/src/components/common/ActionCard';
import HomeBackground from '@/src/components/home/HomeBackground';
import HomeHeader from '@/src/components/home/HomeHeader';
import SecurityFooter from '@/src/components/home/SecurityFooter';
import SocialLoginSection from '@/src/components/home/SocialLoginSection';

/**
 * 초기 진입 홈 화면 (Home)
 * 기존 dummy 데이터를 삭제하고 단일 책임 컴포넌트들을 조립하여 렌더링.
 */
export default function Home() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <HomeBackground />

      <View style={styles.container}>
        {/* Header Section */}
        <HomeHeader />

        {/* Action Cards Section */}
        <View style={styles.cardsContainer}>
          <ActionCard
            title="Create a New Mirror"
            description="Start the journey to find your soul's reflection"
            onPress={() => console.log('Create a New Mirror clicked')}
          />
          <ActionCard
            title="Awaken My Mirror"
            description="Sync back with your existing digital twin"
            onPress={() => console.log('Awaken My Mirror clicked')}
          />
        </View>

        {/* Social Login & Footer (Bottom) */}
        <View style={styles.bottomContainer}>
          <SocialLoginSection />
          <SecurityFooter />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 65,
    justifyContent: 'space-between',
    zIndex: 1, // 백그라운드 위로 올라오도록 보장

  },
  cardsContainer: {
    gap: 24,
    flex: 1,
    justifyContent: 'center',
  },
  bottomContainer: {
    gap: 40,
    paddingTop: 24,
  }
});
