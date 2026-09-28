import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMeetingRequest } from '@/src/services/meetingService';
import type { CreateMeetingRequestPayload } from '@/src/types/api/meeting';

/**
 * 상대 트윈 통화가 서버에서 COMPLETED로 확정된 뒤 만남 신청을 보낸다.
 * 받은 신청 목록은 수신자 기준이지만, 현재 기기에서도 이전 캐시가 남아 있을 수 있어
 * 성공 시 무효화해 다음 매칭 탭 진입에서 최신 상태를 보게 한다.
 */
export const useCreateMeetingRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingRequestPayload) => createMeetingRequest(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['match', 'meetingRequests'] });
    },
  });
};
