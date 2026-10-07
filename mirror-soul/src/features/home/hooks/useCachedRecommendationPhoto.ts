import { useCallback, useSyncExternalStore } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { queryClient } from '@/src/services/queryClient';
import type { RecommendationsResult } from '@/src/types/api/home';

const subscribe = (onChange: () => void) => queryClient.getQueryCache().subscribe(onChange);

/** Observe existing authorized list URLs without another HTTP request or a second query owner. */
export function useCachedRecommendationPhoto(targetUuid: string | null | undefined) {
  const snapshot = useCallback(() => {
    if (!targetUuid) return undefined;
    const data = queryClient.getQueryData<InfiniteData<RecommendationsResult>>(['home', 'recommendations']);
    return data?.pages.flatMap(page => page.recommendations).find(person => person.userUuid === targetUuid)?.profileImageUrl;
  }, [targetUuid]);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
