import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/useAuthStore';
import 'react-native-reanimated';

const queryClient = new QueryClient();

// 백엔드 확정 전까지 사용되는 임시 매핑입니다.
const getOnboardingRoute = (status: string | null) => {
  switch (status) {
    case 'ONBOARD_A': return '/signup/step2';
    case 'ONBOARD_B': return '/signup/step3';
    case 'ONBOARD_C': return '/signup/interview'; // Step 4
    case 'ONBOARD_D': return '/signup/face-scan'; // Step 5
    default: return '/signup';
  }
};

export default function RootLayout() {
  const { isHydrated, isLoggedIn, userStatus, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate(); // 앱 켜지면 무조건 한 번 실행 (온보딩 미완료자면 여기서 로그아웃됨)
  }, []);

  // 상태가 변할 때마다 감시하여 즉시 이동시킵니다.
  useEffect(() => {
    if (!isHydrated) return; 

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
  }, [isHydrated, isLoggedIn, userStatus]);

  if (!isHydrated) return null; // 로딩 중 빈 화면 (필요시 Splash Screen)

  return (
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
  );
}
