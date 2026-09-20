import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getRecommendations } from '@/src/services/homeService';
import { useAuthStore } from '@/src/store/useAuthStore';

const RECOMMENDATIONS_PAGE_SIZE = 10;

/**
 * GET /home/recommend — 오프셋 페이지네이션(page/size/hasNext). 페이지 경계는 이 훅
 * 안에서만 다루고, 화면에는 평탄화된 recommendations 배열만 노출한다.
 */
export const useRecommendationsQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const query = useInfiniteQuery({
    queryKey: ['home', 'recommendations'],
    queryFn: async ({ pageParam }) => (await getRecommendations(pageParam, RECOMMENDATIONS_PAGE_SIZE)).result,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled: isLoggedIn,
    // 기본 재시도(3회)를 끈다 — FORBIDDEN(온보딩 미완료) 같은 에러는 토큰을 갱신해도
    // 절대 안 풀리는데, apiClient.ts 인터셉터가 401/403마다 매번 새로 토큰 갱신을 시도해서
    // 재시도 횟수만큼 그 시도가 그대로 곱해진다.
    retry: false,
  });

  const recommendations = useMemo(
    () => query.data?.pages.flatMap((page) => page.recommendations) ?? [],
    [query.data]
  );

  return { ...query, recommendations };
};
