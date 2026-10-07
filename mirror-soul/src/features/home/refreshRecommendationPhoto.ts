import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { getRecommendationDetail, getRecommendations } from '@/src/services/homeService';
import { useAuthStore } from '@/src/store/useAuthStore';
import type { RecommendationDetailResult, RecommendationsResult } from '@/src/types/api/home';
import { selectProfileImageUrl, shouldRefreshProfileImage } from '@/src/features/profile/photo/profileImageUrl';

/** Refresh just this authorized person's photo, without reranking the swipe list. */
export async function refreshRecommendationPhoto(client: QueryClient, targetUuid: string) {
  const owner = useAuthStore.getState();
  if (!owner.isLoggedIn || !owner.userUuid) throw new Error('다시 로그인해 주세요.');
  const response = await getRecommendationDetail(targetUuid);
  if (!response.isSuccess) throw new Error(response.message);
  const current = useAuthStore.getState();
  if (!current.isLoggedIn || current.userUuid !== owner.userUuid) return;
  if (response.result.userUuid !== targetUuid) throw new Error('프로필 사진의 회원 정보를 확인하지 못했어요.');
  let profileImageUrl = response.result.profileImageUrl;
  if (shouldRefreshProfileImage(profileImageUrl)) {
    const cached = client.getQueryData<InfiniteData<RecommendationsResult>>(['home', 'recommendations']);
    const cachedPage = cached?.pages.find(page => page.recommendations.some(person => person.userUuid === targetUuid));
    const cachedPhoto = cachedPage?.recommendations.find(person => person.userUuid === targetUuid)?.profileImageUrl;
    const lastPage = Math.max(0, cachedPage?.page ?? 0);
    const size = cachedPage?.size ?? 10;
    const pages = [...new Set([lastPage, ...Array.from({ length: lastPage + 1 }, (_, index) => index)])];
    let found = false;
    for (const page of pages) {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || session.userUuid !== owner.userUuid) return;
      const fresh = await getRecommendations(page, size);
      if (!fresh.isSuccess) throw new Error(fresh.message);
      const person = fresh.result.recommendations.find(candidate => candidate.userUuid === targetUuid);
      if (person) { profileImageUrl = selectProfileImageUrl(person.profileImageUrl, cachedPhoto); found = true; break; }
      if (page === 0 && !fresh.result.hasNext) break;
    }
    if (!found) profileImageUrl = selectProfileImageUrl(profileImageUrl, cachedPhoto);
  }
  const latestOwner = useAuthStore.getState();
  if (!latestOwner.isLoggedIn || latestOwner.userUuid !== owner.userUuid) return;
  client.setQueryData<InfiniteData<RecommendationsResult>>(['home', 'recommendations'], old => old ? {
    ...old,
    pages: old.pages.map(page => ({ ...page, recommendations: page.recommendations.map(person => person.userUuid === targetUuid ? { ...person, profileImageUrl } : person) })),
  } : undefined);
  client.setQueryData<RecommendationDetailResult>(['home', 'recommendationDetail', targetUuid], old => old ? { ...old, profileImageUrl } : undefined);
}
