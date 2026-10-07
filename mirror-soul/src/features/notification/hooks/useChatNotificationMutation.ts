import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateNotificationSetting } from '@/src/services/chatService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import type { ChatRoomListResult } from '@/src/types/api/chat';
import { notificationQueryKeys } from './notificationQueryKeys';

type Change = { roomId: number; enabled: boolean; userUuid: string };

/** 목록 화면과 대화방 옵션에서 같은 저장·캐시 갱신을 사용한다. */
export function useChatNotificationMutation(notifyOnError = true) {
  const client = useQueryClient();
  const { showToast } = useToast();
  const lock = useRef(false);
  const mutation = useMutation({
    mutationFn: ({ roomId, enabled, userUuid }: Change) => {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return updateNotificationSetting(roomId, enabled);
    },
    onSuccess: async (response, { userUuid, roomId }) => {
      if (!useAuthStore.getState().isLoggedIn || useAuthStore.getState().userUuid !== userUuid) return;
      await Promise.all([
        client.cancelQueries({ queryKey: notificationQueryKeys.chatRooms(userUuid) }),
        client.cancelQueries({ queryKey: notificationQueryKeys.chatRoom(userUuid, roomId) }),
        client.cancelQueries({ queryKey: ['chat', 'rooms'] }),
      ]);
      if (!useAuthStore.getState().isLoggedIn || useAuthStore.getState().userUuid !== userUuid) return;
      client.setQueryData(notificationQueryKeys.chatRoom(userUuid, roomId), response.result);
      const update = (old: ChatRoomListResult | undefined) => old ? { ...old, rooms: old.rooms.map(room => room.chatRoomId === roomId ? { ...room, notificationEnabled: response.result.enabled } : room) } : old;
      client.setQueryData<ChatRoomListResult>(notificationQueryKeys.chatRooms(userUuid), update);
      // 기존 대화 목록도 동일한 필드를 사용한다.
      client.setQueryData<ChatRoomListResult>(['chat', 'rooms'], update);
    },
    onError: (error, { userUuid }) => {
      if (notifyOnError && useAuthStore.getState().isLoggedIn && useAuthStore.getState().userUuid === userUuid) showToast(getErrorDisplayMessage(error, '메시지 알림 설정을 저장하지 못했어요.'), 'error');
    },
    onSettled: () => { lock.current = false; },
  });
  const change = (roomId: number, enabled: boolean, userUuid: string | null) => {
    const session = useAuthStore.getState();
    if (lock.current || !session.isLoggedIn || !userUuid || session.userUuid !== userUuid) return;
    lock.current = true;
    mutation.mutate({ roomId, enabled, userUuid });
  };
  const session = useAuthStore.getState();
  const saveError = mutation.isError && session.isLoggedIn && session.userUuid === mutation.variables?.userUuid
    ? getErrorDisplayMessage(mutation.error, '메시지 알림 설정을 저장하지 못했어요. 다시 변경해 주세요.')
    : null;
  return { change, isSaving: mutation.isPending, savingRoomId: mutation.isPending ? mutation.variables?.roomId : undefined, saveError };
}
