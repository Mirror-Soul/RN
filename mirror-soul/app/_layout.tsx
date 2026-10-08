import { useAuthStore } from '@/src/store/useAuthStore';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/services/queryClient';
import { Stack, router, useRootNavigationState, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import { ToastProvider } from '@/src/components/common/Toast/ToastProvider';
import { useProactiveTokenRefresh } from '@/src/hooks/useProactiveTokenRefresh';
import { usePushNotificationSetup } from '@/src/features/push/hooks/usePushNotificationSetup';
import { useChatRealtimeConnection } from '@/src/features/chat/hooks/useChatRealtimeConnection';
import { getAuthRedirect } from '@/src/features/auth/onboardingResume';
import { useFonts } from 'expo-font';
import { BROWSE_FONT_ASSETS } from '@/src/constants/browseFonts';

/**
 * 저장된 세션과 로컬 글꼴 준비 전까지 스플래시 화면 유지.
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

/**
 * usePushNotificationSetup은 react-query의 useMutation을 쓰므로 QueryClientProvider 하위에서
 * 호출돼야 한다 — RootLayout 최상단(useProactiveTokenRefresh와 같은 자리)은 Provider보다
 * 먼저 실행되는 컴포넌트 자신의 렌더 단계라 컨텍스트가 아직 없다. UI가 필요 없는 훅이라
 * null만 반환하는 이 컴포넌트로 감싸 Provider 하위에 배치한다.
 */
function PushNotificationSetup() {
  usePushNotificationSetup();
  return null;
}

/** useChatRealtimeConnection도 react-query(queryClient.invalidateQueries 등)를 쓰므로 같은 이유로 Provider 하위에 둔다. */
function ChatRealtimeSetup() {
  useChatRealtimeConnection();
  return null;
}

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(BROWSE_FONT_ASSETS);
  const fontsReady = fontsLoaded || !!fontError;
  const rootNavigationState = useRootNavigationState();
  const pathname = usePathname();
  const { isHydrated, isLoggedIn, userStatus, needsOnboardingResume, hydrate } = useAuthStore();

  // 앱 첫 실행 시 SecureStore에서 토큰 복구
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // access token 만료 전 사전 갱신 (hydration 이후에만 의미 있음 — 훅 내부에서 isLoggedIn/accessToken 가드)
  useProactiveTokenRefresh();

  // Font failures fall back to the original typeface and still allow app startup.
  useEffect(() => {
    if (isHydrated && fontsReady) {
      SplashScreen.hideAsync().catch(() => {
        // 이미 숨겨진 경우 등 무시
      });
    }
  }, [isHydrated, fontsReady]);

  // 인증 상태 변경 감지 → 적절한 화면으로 이동
  useEffect(() => {
    if (!isHydrated || !fontsReady || !rootNavigationState?.key) return;

    const timer = setTimeout(() => {
      const destination = getAuthRedirect({ isLoggedIn, userStatus, pathname, needsOnboardingResume });
      if (destination) router.replace(destination);
    }, 0);

    return () => clearTimeout(timer);
  }, [isHydrated, fontsReady, isLoggedIn, userStatus, needsOnboardingResume, rootNavigationState?.key, pathname]);

  // Wait before mounting navigation to avoid switching fonts on a visible screen.
  if (!isHydrated || !fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PushNotificationSetup />
        <ChatRealtimeSetup />
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
              <Stack.Screen name="discovery-region-settings" />
              <Stack.Screen name="call-detail" />
              <Stack.Screen name="voice-update" />
              <Stack.Screen name="job-verifications" />
              <Stack.Screen name="forgot-password" />
              <Stack.Screen
                name="chat/[id]"
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
