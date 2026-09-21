import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectMeetingRequest } from '@/src/services/meetingService';
import type { MeetingRequestListResult } from '@/src/types/api/meeting';

/**
 * POST /match/meeting/requests/{id}/reject
 * 조회 목록(`GET /match/meeting/requests`)은 PENDING만 내려주므로, 성공 시 재조회 대신
 * 캐시에서 해당 항목만 걸러내 반영한다(응답에 갱신된 목록 전체가 오지 않음).
 */
export const useRejectMeetingRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: number) => rejectMeetingRequest(requestId),
    onSuccess: (_response, requestId) => {
      queryClient.setQueryData<MeetingRequestListResult>(['match', 'meetingRequests'], (old) =>
        old
          ? {
              totalCount: old.totalCount - 1,
              requests: old.requests.filter((r) => r.requestId !== requestId),
            }
          : old
      );
    },
  });
};
