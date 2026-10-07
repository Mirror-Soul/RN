import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '@/src/services/profileService';
import { profileQueryKeys } from './profileQueryKeys';
import { useAuthStore } from '@/src/store/useAuthStore';

/** GET /my-page — 마이페이지 진입 시 이름/이메일 조회. */
export const useProfileQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userUuid = useAuthStore((s) => s.userUuid);
  return useQuery({
    queryKey: profileQueryKeys.me(userUuid),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || !userUuid || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getMyProfile(signal)).result;
    },
    // The server now returns expiring download URLs, so remounts need a fresh response.
    staleTime: 0,
    enabled: isLoggedIn && !!userUuid,
  });
};
