import { useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { sendChatMessage } from '@/src/services/chatService';
import type { ChatRoomListResult, MessageListResult } from '@/src/types/api/chat';

/**
 * POST /chat/rooms/{room-id}/messages — clientMessageId는 매 전송마다 새로 발급한다
 * (재전송 멱등은 네트워크 오류 재시도용이지, 사용자가 같은 내용을 두 번 보내는 걸 막는 용도가 아니다).
 * 발신자 본인은 MESSAGE_CREATED WS 이벤트를 받지 못하므로(findRealtimeRecipientUuids가 제외),
 * REST 응답을 그대로 캐시에 반영해야 화면에 내가 보낸 메시지가 나타난다.
 */
export const useSendMessageMutation = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      sendChatMessage(roomId, { clientMessageId: Crypto.randomUUID(), content }),
    onSuccess: (response) => {
      const message = response.result;

      const patched = queryClient.setQueryData<InfiniteData<MessageListResult>>(
        ['chat', 'messages', roomId],
        (old) => {
          if (!old) return old;
          const pages = [...old.pages];
          pages[0] = { ...pages[0], messages: [...pages[0].messages, message] };
          return { ...old, pages };
        }
      );
      // 메시지 목록 캐시가 아직 없으면(최초 조회 진행 중이거나 이전 조회가 실패한 상태) 위
      // setQueryData가 조용히 아무 일도 하지 않는다 — 전송은 성공했는데 화면엔 영영 안 나타나
      // 사용자가 같은 메시지를 다시 보낼 수 있다. 이 경우 즉시 무효화해서 새로 조회하게 한다.
      if (!patched) {
        queryClient.invalidateQueries({ queryKey: ['chat', 'messages', roomId] });
      }

      queryClient.setQueryData<ChatRoomListResult>(['chat', 'rooms'], (old) => {
        if (!old) return old;
        return {
          ...old,
          rooms: old.rooms.map((room) => (room.chatRoomId === roomId ? { ...room, lastMessage: message } : room)),
        };
      });
    },
  });
};
