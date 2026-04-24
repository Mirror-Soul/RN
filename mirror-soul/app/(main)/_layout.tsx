import BottomNavbar, { BottomTabId } from '@/src/components/home/main/BottomNavbar';
import { Colors } from '@/src/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * (main) 그룹 탭 레이아웃
 * expo-router의 Tabs를 사용하여 탭별 네비게이션 스택을 독립적으로 유지합니다.
 */
export default function MainLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
        }}
        tabBar={({ state, navigation }) => {
          // 현재 활성화된 라우트 이름을 BottomTabId로 매핑
          const routeName = state.routes[state.index].name;
          const activeTab: BottomTabId = routeName === 'index' ? 'discover' : (routeName as BottomTabId);

          return (
            <BottomNavbar
              activeTab={activeTab}
              onTabPress={(tab) => {
                const destRoute = tab === 'discover' ? 'index' : tab;
                navigation.navigate(destRoute);
              }}
            />
          );
        }}
      >
        <Tabs.Screen name="history" />
        <Tabs.Screen name="grow" />
        <Tabs.Screen name="index" />
        <Tabs.Screen name="match" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
});
