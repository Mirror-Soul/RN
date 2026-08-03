import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';

/** GET /my-page — 마이페이지 진입 시 이름/이메일 조회. */
export const useProfileQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => (await getMyProfile()).result,
    staleTime: 60_000,
    enabled: isLoggedIn,
  });
};
