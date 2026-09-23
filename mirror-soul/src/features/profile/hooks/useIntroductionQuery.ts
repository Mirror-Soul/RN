import { useQuery } from '@tanstack/react-query';
import { getMyIntroduction } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { introductionPreview } from '../constants/introductionPreview';

/** GET /my-page/introduction — 본인 소개 화면 전용 상세 프로필 조회. */
export const useIntroductionQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const query = useQuery({
    queryKey: ['profile', 'introduction'],
    queryFn: async () => {
      try {
        return (await getMyIntroduction()).result;
      } catch (error) {
        // API 구현 전 UI 점검은 개발 모드에서만 허용한다. 운영에서는 API 오류를 그대로 노출한다.
        if (__DEV__) return introductionPreview;
        throw error;
      }
    },
    // 음성 URL은 presigned URL일 수 있어, 소개 화면을 다시 열 때 새 URL을 받는다.
    staleTime: 0,
    enabled: isLoggedIn,
  });

  return {
    ...query,
    isPreview: query.data === introductionPreview,
  };
};
