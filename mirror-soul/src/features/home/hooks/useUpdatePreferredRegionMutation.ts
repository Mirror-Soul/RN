import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePreferredRegion } from '@/src/services/homeService';
import type { UpdatePreferredRegionRequest } from '@/src/types/api/home';

/**
 * PUT /home/preferred-region — 탐색 지역(동 앵커+반경) 설정.
 * 백엔드가 재계산한 결과를 그대로 캐시에 반영하고, 추천 목록도 함께 무효화한다 —
 * 추천 목록(['home','recommendations'])은 하드 필터 결과라 지역 설정이 바뀌면 내용 자체가
 * 달라지는데, setQueryData만으로는 이 쿼리가 갱신되지 않는다. 무효화 없이 두면 지역을 바꾼
 * 직후에도 화면(설정 화면 → Discovery 탭)이 계속 떠 있는 한 옛 목록이 그대로 보일 수 있다.
 */
export const useUpdatePreferredRegionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferredRegionRequest) => updatePreferredRegion(data),
    onSuccess: (response) => {
      queryClient.setQueryData(['home', 'preferredRegion'], response.result);
      queryClient.invalidateQueries({ queryKey: ['home', 'recommendations'] });
    },
  });
};
