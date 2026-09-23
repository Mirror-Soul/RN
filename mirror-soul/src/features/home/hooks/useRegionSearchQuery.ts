import { useQuery } from '@tanstack/react-query';
import { searchRegions } from '@/src/services/regionService';

/**
 * GET /regions/search?keyword= — 동/구 이름 검색.
 * keyword가 비어있으면 호출하지 않는다 — 타이핑마다 호출하지 않도록 디바운스하는 건 호출부 책임.
 */
export const useRegionSearchQuery = (keyword: string) => {
  const trimmedKeyword = keyword.trim();

  return useQuery({
    queryKey: ['regions', 'search', trimmedKeyword],
    queryFn: async () => (await searchRegions(trimmedKeyword)).result,
    enabled: trimmedKeyword.length > 0,
  });
};
