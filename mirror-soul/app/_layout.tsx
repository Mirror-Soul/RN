import { useAuthStore } from '@/src/store/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * hydration 완료 전까지 스플래시 화면 유지.
 * 반드시 컴포넌트 렌더링 전에 호출되어야 합니다.
 */
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// 백엔드 확정 전 임시 온보딩 라우트 매핑
const getOnboardingRoute = (status: string | null) => {
  switch (status) {
    case 'ONBOARD_A': return '/signup/profile';
    case 'ONBOARD_B': return '/signup/express';
    case 'ONBOARD_C': return '/signup/interview';
    case 'ONBOARD_D': return '/signup/face-scan';
    default:          return '/signup';
  }
};

export default function RootLayout() {
  const rootNavigationState = useRootNavigationState();
  const { isHydrated, isLoggedIn, userStatus, hydrate } = useAuthStore();

  // 앱 첫 실행 시 SecureStore에서 토큰 복구
  useEffect(() => {
    hydrate();
  }, []);

  // hydration 완료 → 스플래시 숨김
  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync().catch(() => {
        // 이미 숨겨진 경우 등 무시
      });
    }
  }, [isHydrated]);

  // 인증 상태 변경 감지 → 적절한 화면으로 이동
  useEffect(() => {
    if (!isHydrated || !rootNavigationState?.key) return;

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        if (userStatus === 'ACTIVE') {
          router.replace('/(main)');
        } else if (userStatus?.startsWith('ONBOARD_')) {
          router.replace(getOnboardingRoute(userStatus));
        }
      } else {
        router.replace('/');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isHydrated, isLoggedIn, userStatus, rootNavigationState?.key]);

  // hydration 전: null 반환 (SplashScreen이 화면을 가림)
  if (!isHydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              // 화면 전환 시 부드러운 fade 애니메이션
              animation: 'fade',
              animationDuration: 200,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
            <Stack.Screen name="call-detail" />
            <Stack.Screen name="voice-update" />
          </Stack>
          <StatusBar style="light" />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
