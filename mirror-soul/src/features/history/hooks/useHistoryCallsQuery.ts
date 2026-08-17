import { useQuery } from '@tanstack/react-query';
import { getCallHistory } from '@/src/services/historyService';
import { useAuthStore } from '@/src/store/useAuthStore';

/**
 * GET /history/calls?type=ALL — 최근 7일 통화 내역 전체를 한 번만 조회한다.
 * 백엔드 HistoryService.getCallHistory()는 summary를 항상 type 파라미터와 무관하게
 * 7일 전체 기준으로 계산하고, type은 groups(목록)에만 적용된다 — 즉 서버에 RECEIVED/SENT로
 * 다시 물어봐도 항목 자체는 ALL 응답의 부분집합과 동일하다. 방향 필터는 화면(HistoryList)에서
 * 클라이언트로 걸러서, 필터 전환 시 재요청 없이 즉시 반영되게 한다.
 */
export const useHistoryCallsQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['history', 'calls'],
    queryFn: async () => (await getCallHistory('ALL')).result,
    staleTime: 30_000,
    enabled: isLoggedIn,
  });
};
