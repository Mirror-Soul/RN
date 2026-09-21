import { useQuery } from '@tanstack/react-query';
import { getHome } from '@/src/services/homeService';
import { useAuthStore } from '@/src/store/useAuthStore';

/**
 * GET /home — 현재 설정된 탐색 지역(동 앵커+반경) 조회. 미설정 시 result.preferredRegion은 null.
 * 응답의 remainingTalkTime은 사용하지 않는다 — 잔여 대화 시간은
 * AvailableTimeCard가 GET /my-page/buy-time(useTimeStatusQuery)으로 별도 관리한다.
 */
export const usePreferredRegionQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['home', 'preferredRegion'],
    queryFn: async () => (await getHome()).result.preferredRegion,
    enabled: isLoggedIn,
  });
};
