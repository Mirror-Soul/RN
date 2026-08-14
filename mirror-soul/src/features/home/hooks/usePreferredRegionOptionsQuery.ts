import { useQuery } from '@tanstack/react-query';
import { getPreferredRegionOptions } from '@/src/services/homeService';
import { useAuthStore } from '@/src/store/useAuthStore';
import type { PreferredRegion } from '@/src/types/api/home';

export interface GroupedRegionOption {
  sidoName: string;
  sigungus: PreferredRegion[];
}

const groupBySido = (regions: PreferredRegion[]): GroupedRegionOption[] => {
  const bySidoName = new Map<string, PreferredRegion[]>();
  for (const region of regions) {
    const group = bySidoName.get(region.sidoName) ?? [];
    group.push(region);
    bySidoName.set(region.sidoName, group);
  }
  return Array.from(bySidoName.entries()).map(([sidoName, sigungus]) => ({ sidoName, sigungus }));
};

/**
 * GET /home/preferred-regions/options — 선택 가능한 시군구 전체 목록.
 * 백엔드는 flat list를 주므로 sidoName 기준으로 그룹핑해서 반환한다.
 */
export const usePreferredRegionOptionsQuery = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: ['home', 'preferredRegionOptions'],
    queryFn: async () => (await getPreferredRegionOptions()).result.regions,
    select: groupBySido,
    staleTime: 5 * 60_000,
    enabled: isLoggedIn,
  });
};
