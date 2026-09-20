import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptMeetingRequest } from '@/src/services/meetingService';
import type { MeetingRequestListResult } from '@/src/types/api/meeting';
import type { ChatRoomListResult } from '@/src/types/api/chat';

/**
 * POST /match/meeting/requests/{id}/accept
 * 조회 목록(`GET /match/meeting/requests`)은 PENDING만 내려주므로, 성공 시 재조회 대신
 * 캐시에서 해당 항목만 걸러내 반영한다(응답에 갱신된 목록 전체가 오지 않음).
 */
export const useAcceptMeetingRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: number) => acceptMeetingRequest(requestId),
    onSuccess: async (response, requestId) => {
      queryClient.setQueryData<MeetingRequestListResult>(['match', 'meetingRequests'], (old) =>
        old
          ? {
              totalCount: old.totalCount - 1,
              requests: old.requests.filter((r) => r.requestId !== requestId),
            }
          : old
      );
      // match.tsx가 성공 직후 새로 생긴 채팅방으로 바로 딥링크한다 — 그 방이 실제로
      // GET /chat/rooms 결과에 포함될 때까지 이 onSuccess가 끝나지 않도록 기다려서(useMutation은
      // 훅 onSuccess가 async면 완료를 기다린 뒤에야 mutate() 호출부의 onSuccess를 실행한다),
      // 화면 전환 시점엔 캐시가 이미 최신인 걸 보장한다.
      await queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });

      // invalidateQueries는 재조회가 실패해도 reject하지 않으므로 위 await만으로는 새 방이
      // 실제로 캐시에 들어왔다는 보장이 안 된다 — 없으면 한 번 더 명시적으로 재조회한다.
      const chatRoomId = response.result.chatRoomId;
      const rooms = queryClient.getQueryData<ChatRoomListResult>(['chat', 'rooms']);
      if (!rooms?.rooms.some((room) => room.chatRoomId === chatRoomId)) {
        await queryClient.refetchQueries({ queryKey: ['chat', 'rooms'] });
      }
    },
  });
};
