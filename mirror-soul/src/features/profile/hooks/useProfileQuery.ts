import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '@/src/services/profileService';

/** GET /my-page — 마이페이지 진입 시 이름/이메일 조회. */
export const useProfileQuery = () =>
  useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => (await getMyProfile()).result,
    staleTime: 60_000,
  });
