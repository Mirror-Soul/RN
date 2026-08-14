import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePreferredRegions } from '@/src/services/homeService';
import type { PreferredRegionInput } from '@/src/types/api/home';

/** PUT /home/preferred-regions — 선호 지역 설정. 백엔드가 최신 목록을 돌려주므로 그대로 캐시에 반영한다. */
export const useUpdatePreferredRegionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regions: PreferredRegionInput[]) => updatePreferredRegions({ regions }),
    onSuccess: (response) => {
      queryClient.setQueryData(['home', 'preferredRegions'], response.result.preferredRegions);
    },
  });
};
