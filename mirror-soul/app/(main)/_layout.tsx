import BottomNavbar, { BottomTabId } from '@/src/components/home/main/BottomNavbar';
import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import { Slot } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

/**
 * (main) 그룹 공유 레이아웃
 * BottomNavbar를 1회 선언하여 탭 전환 시 재마운트 없이 공유합니다.
 */
export default function MainLayout() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BottomTabId>('discover');

  const handleTabPress = (tab: BottomTabId) => {
    setActiveTab(tab);
    // TODO: 각 탭 라우트 이동 (추후 탭별 화면 구현 시 연결)
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Slot />
      </View>
      <View style={styles.navbarWrapper}>
        <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  content: {
    flex: 1,
  },
  navbarWrapper: {
    paddingBottom: 16,
  },
});
