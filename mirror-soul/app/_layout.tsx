import { useAuthStore } from '@/src/store/useAuthStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/services/queryClient';
import { Stack, router, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import { ToastProvider } from '@/src/components/common/Toast/ToastProvider';
import { useProactiveTokenRefresh } from '@/src/hooks/useProactiveTokenRefresh';

/**
 * hydration 완료 전까지 스플래시 화면 유지.
 * 반드시 컴포넌트 렌더링 전에 호출되어야 합니다.
 */
SplashScreen.preventAutoHideAsync();

// DSN이 없으면(로컬 개발 등) 크래시 리포팅을 초기화하지 않습니다.
// 실제 DSN은 Sentry 프로젝트 생성 후 .env의 EXPO_PUBLIC_SENTRY_DSN에 설정하세요.
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    sendDefaultPii: false,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  });
}

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

function RootLayout() {
  const rootNavigationState = useRootNavigationState();
  const { isHydrated, isLoggedIn, userStatus, hydrate } = useAuthStore();

  // 앱 첫 실행 시 SecureStore에서 토큰 복구
  useEffect(() => {
    hydrate();
  }, []);

  // access token 만료 전 사전 갱신 (hydration 이후에만 의미 있음 — 훅 내부에서 isLoggedIn/accessToken 가드)
  useProactiveTokenRefresh();

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
        // (main) 그룹의 홈 탭도 파일명이 index라 로그인 화면을 "/"에 두면 두 화면이
        // 같은 경로를 두고 충돌해 로그아웃 후에도 홈 화면에 머무는 버그가 생긴다.
        // 그래서 로그인 화면은 /login(app/login.tsx)이라는 고유 경로를 쓴다.
        router.replace('/login');
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
          <ToastProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                // 화면 전환 시 부드러운 fade 애니메이션
                animation: 'fade',
                animationDuration: 200,
              }}
            >
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="(main)" options={{ animation: 'fade' }} />
              <Stack.Screen name="call-detail" />
              <Stack.Screen name="voice-update" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen
                name="message-room/[id]"
                options={{ animation: 'slide_from_right' }}
              />
            </Stack>
            <StatusBar style="light" />
          </ToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

// DSN 미설정 시 Sentry.init을 호출하지 않으므로 wrap()도 순수 pass-through로 동작합니다.
export default Sentry.wrap(RootLayout);
