import { useQuery } from '@tanstack/react-query';
import { getMyIntroduction } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { isNotFoundError } from '@/src/utils/apiErrorCode';
import { introductionPreview } from '../constants/introductionPreview';

/** GET /my-page/profile — 본인 소개 화면 전용 상세 프로필 조회. */
export const useIntroductionQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const query = useQuery({
    queryKey: ['profile', 'introduction'],
    queryFn: async () => {
      try {
        return (await getMyIntroduction()).result;
      } catch (error) {
        // 아직 이 라우트가 배포되지 않은 환경(API_NOT_FOUND)만 개발 모드에서 목데이터로
        // 대체한다 — 401/500/네트워크 오류 같은 진짜 문제까지 가리면 배포 후 실제 장애를
        // 놓칠 수 있어서 404로 좁혔다.
        if (__DEV__ && isNotFoundError(error)) return introductionPreview;
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
