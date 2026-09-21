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

      queryClient.setQueryData<InfiniteData<MessageListResult>>(['chat', 'messages', roomId], (old) => {
        if (!old) return old;
        const pages = [...old.pages];
        pages[0] = { ...pages[0], messages: [...pages[0].messages, message] };
        return { ...old, pages };
      });

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
