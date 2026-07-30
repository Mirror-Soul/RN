import { useQuery } from '@tanstack/react-query';
import { getMyTime } from '@/src/services/profileService';

/**
 * GET /my-page/buy-time — 남은 대화 시간 조회.
 * 잔액 성격상 캐시로 인한 오차를 허용하지 않는다 (staleTime: 0 — 항상 최신 값 확인).
 */
export const useTimeStatusQuery = () =>
  useQuery({
    queryKey: ['profile', 'time'],
    queryFn: async () => (await getMyTime()).result,
    staleTime: 0,
  });
