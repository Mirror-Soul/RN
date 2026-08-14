import { useQuery } from '@tanstack/react-query';
import { getHome } from '@/src/services/homeService';
import { useAuthStore } from '@/src/store/useAuthStore';

/**
 * GET /home — 현재 설정된 선호 지역 조회.
 * 응답의 remainingTalkTime은 사용하지 않는다 — 잔여 대화 시간은
 * AvailableTimeCard가 GET /my-page/buy-time(useTimeStatusQuery)으로 별도 관리한다.
 */
export const usePreferredRegionsQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['home', 'preferredRegions'],
    queryFn: async () => (await getHome()).result.preferredRegions,
    enabled: isLoggedIn,
  });
};
