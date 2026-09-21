import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readChatMessages } from '@/src/services/chatService';
import type { ChatRoomListResult } from '@/src/types/api/chat';

/** PATCH /chat/rooms/{room-id}/read — 성공 시 방 목록 캐시의 unreadCount를 0으로 반영한다. */
export const useReadMessagesMutation = (roomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lastReadMessageId: number) => readChatMessages(roomId, lastReadMessageId),
    onSuccess: () => {
      queryClient.setQueryData<ChatRoomListResult>(['chat', 'rooms'], (old) => {
        if (!old) return old;
        return {
          ...old,
          rooms: old.rooms.map((room) => (room.chatRoomId === roomId ? { ...room, unreadCount: 0 } : room)),
        };
      });
    },
  });
};
