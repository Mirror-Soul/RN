import { useQuery } from '@tanstack/react-query';
import { getMyTime } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';

/**
 * GET /my-page/buy-time — 남은 대화 시간 조회.
 * 잔액 성격상 캐시로 인한 오차를 허용하지 않는다 (staleTime: 0 — 항상 최신 값 확인).
 */
export const useTimeStatusQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['profile', 'time'],
    queryFn: async () => (await getMyTime()).result,
    staleTime: 0,
    // 로그인 전(로그인 화면, 로그아웃 직후 등)에 인증 필요 API를 호출하지 않는다.
    enabled: isLoggedIn,
  });
};
