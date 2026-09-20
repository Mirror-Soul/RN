import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotificationSetting, updateNotificationSetting } from '@/src/services/chatService';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

/** GET/PATCH /chat/rooms/{room-id}/notification 결합형 훅(useVoiceAudioSettings.ts 패턴). */
export const useChatNotificationSettings = (roomId: number) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat', 'notification', roomId],
    queryFn: async () => (await getNotificationSetting(roomId)).result,
  });

  const mutation = useMutation({
    mutationFn: (enabled: boolean) => updateNotificationSetting(roomId, enabled),
    onSuccess: (response) => {
      queryClient.setQueryData(['chat', 'notification', roomId], response.result);
    },
    onError: (error) => {
      Alert.alert('설정 변경 실패', getErrorDisplayMessage(error, '알림 설정을 변경하지 못했습니다.'));
    },
  });

  const handleToggle = useCallback(() => {
    if (!query.data) return; // 조회 완료 전에는 변경 자체를 막는다.
    mutation.mutate(!query.data.enabled);
  }, [mutation, query.data]);

  return {
    enabled: query.data?.enabled ?? false,
    handleToggle,
    // query.isLoading || !query.data로 두면 조회가 실패했을 때도(data가 계속 없으므로)
    // 영원히 로딩 상태로 보여 스위치가 원인 표시 없이 계속 비활성화된 채로 남는다.
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
