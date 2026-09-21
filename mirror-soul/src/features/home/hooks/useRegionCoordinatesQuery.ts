import { useQuery } from '@tanstack/react-query';
import { getRegionCoordinates } from '@/src/services/regionService';

/**
 * GET /regions/coordinates — 좌표 포함 전국 읍면동 목록.
 * 세션 동안 사실상 불변인 참조 데이터라 staleTime을 무한으로 잡아 재요청을 피한다
 * (동 단위 행정구역/좌표가 앱 실행 중 바뀔 일은 없음 — 새로고침은 앱 재시작으로 충분).
 */
export const useRegionCoordinatesQuery = () => {
  return useQuery({
    queryKey: ['regions', 'coordinates'],
    queryFn: async () => (await getRegionCoordinates()).result,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
