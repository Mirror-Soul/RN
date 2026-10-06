import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { getRecommendationDetail } from '@/src/services/homeService';
import { useAuthStore } from '@/src/store/useAuthStore';
import type { RecommendationDetailResult, RecommendationsResult } from '@/src/types/api/home';

/** Refresh just this authorized person's photo, without reranking the swipe list. */
export async function refreshRecommendationPhoto(client: QueryClient, targetUuid: string) {
  const owner = useAuthStore.getState();
  if (!owner.isLoggedIn || !owner.userUuid) throw new Error('다시 로그인해 주세요.');
  const response = await getRecommendationDetail(targetUuid);
  if (!response.isSuccess) throw new Error(response.message);
  const current = useAuthStore.getState();
  if (!current.isLoggedIn || current.userUuid !== owner.userUuid) return;
  if (response.result.userUuid !== targetUuid) throw new Error('프로필 사진의 회원 정보를 확인하지 못했어요.');
  const profileImageUrl = response.result.profileImageUrl;
  client.setQueryData<InfiniteData<RecommendationsResult>>(['home', 'recommendations'], old => old ? {
    ...old,
    pages: old.pages.map(page => ({ ...page, recommendations: page.recommendations.map(person => person.userUuid === targetUuid ? { ...person, profileImageUrl } : person) })),
  } : undefined);
  client.setQueryData<RecommendationDetailResult>(['home', 'recommendationDetail', targetUuid], old => old ? { ...old, profileImageUrl } : undefined);
}
