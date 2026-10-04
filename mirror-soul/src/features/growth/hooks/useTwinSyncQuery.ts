import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/useAuthStore';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';
import { getTwinSync } from '@/src/services/evolveService';

/** GET /evolve — 성장 탭 헤드라인에 쓰이는 트윈 유사도(Sync Rate) 조회. */
export const useTwinSyncQuery = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const userUuid = useAuthStore(s => s.userUuid);
  return useQuery({
    queryKey: profileQueryKeys.twinSync(userUuid),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || !userUuid || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getTwinSync(signal)).result;
    },
    staleTime: 30_000,
    enabled: isLoggedIn && !!userUuid,
  });
};
