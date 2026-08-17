import { useQuery } from '@tanstack/react-query';
import { getWeeklySummary } from '@/src/services/historyService';
import { useAuthStore } from '@/src/store/useAuthStore';

/** GET /history/weekly-summary — 이번 주(월요일 00시 기준) 누적 대화시간/받은·보낸 통화 수 통계. */
export const useWeeklySummaryQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['history', 'weeklySummary'],
    queryFn: async () => (await getWeeklySummary()).result,
    staleTime: 30_000,
    enabled: isLoggedIn,
  });
};
