import { useQuery } from '@tanstack/react-query';
import { getTwinSync } from '@/src/services/evolveService';

/** GET /evolve — 성장 탭 헤드라인에 쓰이는 트윈 유사도(Sync Rate) 조회. */
export const useTwinSyncQuery = () => {
  return useQuery({
    queryKey: ['growth', 'twinSync'],
    queryFn: async () => (await getTwinSync()).result,
    staleTime: 30_000,
  });
};
