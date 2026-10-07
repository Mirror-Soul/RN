import BottomNavbar from '@/src/components/home/main/BottomNavbar';
import { Colors } from '@/src/constants/theme';
import { ROUTE_TO_TAB, TAB_TO_ROUTE } from '@/src/constants/routes/mainRoutes';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { FloatingTabBarInsetContext } from '@/src/components/common/FloatingTabBarInsetContext';
import { TabBarScrollProvider } from '@/src/components/common/TabBarScrollContext';

/**
 * (main) 그룹 탭 레이아웃
 * expo-router의 Tabs를 사용하여 탭별 네비게이션 스택을 독립적으로 유지합니다.
 */
export default function MainLayout() {
  const { colors } = useThemeColors();
  const [tabBarInset, setTabBarInset] = useState(0);

  return (
    <TabBarScrollProvider><FloatingTabBarInsetContext.Provider value={tabBarInset}>
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Tabs
          initialRouteName="index"
          backBehavior="none"
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
                activeRoute={routeName}
                onObstructionHeightChange={setTabBarInset}
                onTabPress={(tab) => {
                  const destRoute = TAB_TO_ROUTE[tab];
                  const target = state.routes.find(route => route.name === destRoute);
                  if (!target) return;
                  const event = navigation.emit({ type: 'tabPress', target: target.key, canPreventDefault: true });
                  if (state.routes[state.index].key !== target.key && !event.defaultPrevented) navigation.navigate(destRoute);
                }}
                onTabLongPress={tab => {
                  const target = state.routes.find(route => route.name === TAB_TO_ROUTE[tab]);
                  if (target) navigation.emit({ type: 'tabLongPress', target: target.key });
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
          <Tabs.Screen name="profile-introduction" options={{ href: null }} />
          <Tabs.Screen name="voice-audio" options={{ unmountOnBlur: true }} />
          <Tabs.Screen name="notification" options={{ unmountOnBlur: true }} />
          <Tabs.Screen name="customer-center" options={{ unmountOnBlur: true }} />
          <Tabs.Screen name="terms-policy" options={{ unmountOnBlur: true }} />
        </Tabs>
      </View>
    </FloatingTabBarInsetContext.Provider></TabBarScrollProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
});
