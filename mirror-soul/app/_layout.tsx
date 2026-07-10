import { useAuthStore } from '@/src/store/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

// 백엔드 확정 전까지 사용되는 임시 매핑입니다.
const getOnboardingRoute = (status: string | null) => {
  switch (status) {
    case 'ONBOARD_A': return '/signup/profile';
    case 'ONBOARD_B': return '/signup/express';
    case 'ONBOARD_C': return '/signup/interview';
    case 'ONBOARD_D': return '/signup/face-scan';
    default: return '/signup';
  }
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const rootNavigationState = useRootNavigationState();
  const { isHydrated, isLoggedIn, userStatus, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate(); // 앱 켜지면 무조건 한 번 실행 (온보딩 미완료자면 여기서 로그아웃됨)
  }, []);

  // 상태가 변할 때마다 감시하여 즉시 이동시킵니다.
  useEffect(() => {
    if (!isHydrated || !rootNavigationState?.key) return;

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        if (userStatus === 'ACTIVE') {
          // 이미 메인 화면 구현이 안되어있을 수 있지만 기획상 메인 라우트로 이동
          router.replace('/(main)');
        } else if (userStatus?.startsWith('ONBOARD_')) {
          // 로그인 한 미완료자는 해당하는 곳으로 강제 이동
          router.replace(getOnboardingRoute(userStatus));
        }
      } else {
        // 미로그인 상태면 처음 화면(로그인 화면)
        router.replace('/');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isHydrated, isLoggedIn, userStatus, rootNavigationState?.key]);

  if (!isHydrated) return null; // 로딩 중 빈 화면 (필요시 Splash Screen)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="(main)" />
            {/* 기존 스크린 유지 */}
            <Stack.Screen name="call-detail" />
            <Stack.Screen name="voice-update" />
          </Stack>
          <StatusBar style="light" />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
