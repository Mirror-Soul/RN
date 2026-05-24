import BottomNavbar from '@/src/components/home/main/BottomNavbar';
import { Colors } from '@/src/constants/theme';
import { ROUTE_TO_TAB, TAB_TO_ROUTE } from '@/src/constants/routes/mainRoutes';
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
          // ROUTE_TO_TAB 상수를 사용하여 현재 활성화된 탭 ID를 결정
          const routeName = state.routes[state.index].name;
          const activeTab = ROUTE_TO_TAB[routeName] ?? 'discover';

          return (
            <BottomNavbar
              activeTab={activeTab}
              onTabPress={(tab) => {
                // TAB_TO_ROUTE 상수를 사용하여 이동할 라우트명을 결정
                const destRoute = TAB_TO_ROUTE[tab];
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
