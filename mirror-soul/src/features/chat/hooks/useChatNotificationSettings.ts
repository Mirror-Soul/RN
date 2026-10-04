import { useQuery } from '@tanstack/react-query';
import { getNotificationSetting } from '@/src/services/chatService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useChatNotificationMutation } from '@/src/features/notification/hooks/useChatNotificationMutation';
import { notificationQueryKeys } from '@/src/features/notification/hooks/notificationQueryKeys';

/** 대화방 옵션과 알림 관리 화면에서 같은 서버 설정을 사용한다. */
export const useChatNotificationSettings = (roomId: number, isActive = true) => {
  const userUuid = useAuthStore(s => s.userUuid);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const query = useQuery({
    queryKey: notificationQueryKeys.chatRoom(userUuid, roomId),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getNotificationSetting(roomId, signal)).result;
    },
    enabled: isActive && isLoggedIn && !!userUuid,
  });
  const mutation = useChatNotificationMutation();
  return {
    enabled: query.data?.enabled ?? null,
    handleToggle: () => { if (isActive && query.data) mutation.change(roomId, !query.data.enabled, userUuid); },
    isLoading: isActive && query.isLoading,
    isSaving: mutation.isSaving,
    saveError: mutation.saveError,
    isError: isActive && query.isError,
    refetch: query.refetch,
  };
};
