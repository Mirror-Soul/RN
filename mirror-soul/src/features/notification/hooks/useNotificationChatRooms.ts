import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getChatRooms } from '@/src/services/chatService';
import { notificationQueryKeys } from './notificationQueryKeys';
import { useChatNotificationMutation } from './useChatNotificationMutation';

export function useNotificationChatRooms(visible: boolean) {
  const userUuid = useAuthStore(s => s.userUuid);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const query = useQuery({
    queryKey: notificationQueryKeys.chatRooms(userUuid),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getChatRooms(signal)).result;
    },
    enabled: visible && isLoggedIn && !!userUuid,
    staleTime: 60_000,
  });
  const mutation = useChatNotificationMutation(false);
  const toggle = (roomId: number) => {
    const room = query.data?.rooms.find(item => item.chatRoomId === roomId);
    if (visible && room) mutation.change(roomId, !room.notificationEnabled, userUuid);
  };
  return { ...query, ...mutation, toggle };
}
