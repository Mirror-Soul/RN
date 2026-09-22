import { useQuery } from '@tanstack/react-query';
import { getMyIntroduction } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';

/** GET /my-page/introduction — 본인 소개 화면 전용 상세 프로필 조회. */
export const useIntroductionQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return useQuery({
    queryKey: ['profile', 'introduction'],
    queryFn: async () => (await getMyIntroduction()).result,
    // 음성 URL은 presigned URL일 수 있어, 소개 화면을 다시 열 때 새 URL을 받는다.
    staleTime: 0,
    enabled: isLoggedIn,
  });
};
