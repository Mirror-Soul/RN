import { useQuery } from '@tanstack/react-query';
import { getRecommendationDetail } from '@/src/services/homeService';
import { useAuthStore } from '@/src/store/useAuthStore';

/**
 * GET /home/recommendations/{uuid} — 상세 모달이 열려있는 동안만 활성화.
 * staleTime을 일부러 지정하지 않는다(v5 기본값 0) — voicePreview.audioUrl이 만료시간 있는
 * presigned URL이라, 오래 캐시하면 재오픈 시 이미 만료된 URL을 그대로 재생 시도할 수 있다.
 */
export const useRecommendationDetailQuery = (targetUserUuid: string | null) => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['home', 'recommendationDetail', targetUserUuid],
    queryFn: async () => (await getRecommendationDetail(targetUserUuid!)).result,
    enabled: isLoggedIn && !!targetUserUuid,
    // 기본 재시도(3회)를 끈다 — RECOMMENDATION_TARGET_NOT_FOUND 등은 토큰 갱신으로 해결되지
    // 않는데, apiClient.ts 인터셉터가 401/403마다 매번 새로 토큰 갱신을 시도해서 재시도
    // 횟수만큼 그 시도가 그대로 곱해진다(useRecommendationsQuery.ts와 동일한 이유).
    retry: false,
  });
};
