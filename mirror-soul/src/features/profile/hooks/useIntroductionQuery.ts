import { useQuery } from '@tanstack/react-query';
import { getMyIntroduction } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { profileQueryKeys } from './profileQueryKeys';

/** GET /my-page/profile — 본인 공개 프로필의 정본. 실패를 예시 데이터로 대체하지 않는다. */
export const useIntroductionQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const userUuid = useAuthStore((s) => s.userUuid);
  const query = useQuery({
    queryKey: profileQueryKeys.introduction(userUuid),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || !userUuid || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getMyIntroduction(signal)).result;
    },
    // 만료되는 미디어 URL은 화면을 다시 열 때 갱신한다.
    staleTime: 0,
    enabled: isLoggedIn && !!userUuid,
  });
  return { ...query, isPreview: false };
};
