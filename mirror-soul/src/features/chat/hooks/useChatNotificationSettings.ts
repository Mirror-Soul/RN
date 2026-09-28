import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationSetting, updateNotificationSetting } from '@/src/services/chatService';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import type { ChatRoomListResult } from '@/src/types/api/chat';

/** GET/PATCH /chat/rooms/{room-id}/notification 결합형 훅(useVoiceAudioSettings.ts 패턴). */
export const useChatNotificationSettings = (roomId: number, isActive = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat', 'notification', roomId],
    queryFn: async () => (await getNotificationSetting(roomId)).result,
    // 옵션 패널을 실제로 열었을 때만 조회한다. 채팅방 진입만으로 별도의 설정 API가
    // 호출되면 화면을 보지도 않은 사용자에게 불필요한 네트워크 요청이 발생한다.
    enabled: isActive,
  });

  const mutation = useMutation({
    mutationFn: (enabled: boolean) => updateNotificationSetting(roomId, enabled),
    onSuccess: (response) => {
      queryClient.setQueryData(['chat', 'notification', roomId], response.result);
      // GET /chat/rooms도 같은 notificationEnabled 필드를 내려준다. 옵션 패널에서 바꾼
      // 값이 뒤로 가기 전 목록에도 즉시 반영되도록 두 캐시를 함께 동기화한다.
      queryClient.setQueryData<ChatRoomListResult>(['chat', 'rooms'], (old) => {
        if (!old) return old;
        return {
          ...old,
          rooms: old.rooms.map((room) =>
            room.chatRoomId === roomId
              ? { ...room, notificationEnabled: response.result.enabled }
              : room
          ),
        };
      });
    },
    onError: (error) => {
      Alert.alert('설정 변경 실패', getErrorDisplayMessage(error, '알림 설정을 변경하지 못했습니다.'));
    },
  });

  const handleToggle = useCallback(() => {
    if (!isActive || !query.data) return; // 조회 완료 전에는 변경 자체를 막는다.
    mutation.mutate(!query.data.enabled);
  }, [isActive, mutation, query.data]);

  return {
    enabled: query.data?.enabled ?? false,
    handleToggle,
    // query.isLoading || !query.data로 두면 조회가 실패했을 때도(data가 계속 없으므로)
    // 영원히 로딩 상태로 보여 스위치가 원인 표시 없이 계속 비활성화된 채로 남는다.
    isLoading: isActive && query.isLoading,
    isError: isActive && query.isError,
    refetch: query.refetch,
  };
};
