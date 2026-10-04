import { useQuery } from '@tanstack/react-query';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';
import { getAccountInfo } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';

/** GET /my-page/account — 계정관리 화면의 닉네임 조회. */
export const useAccountInfoQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userUuid = useAuthStore(s => s.userUuid);
  return useQuery({
    queryKey: profileQueryKeys.accountInfo(userUuid),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getAccountInfo(signal)).result;
    },
    staleTime: 60_000,
    enabled: isLoggedIn && !!userUuid,
  });
};
