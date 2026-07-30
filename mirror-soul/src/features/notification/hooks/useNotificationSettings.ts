import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAlarmSetting, modifyAlarmSetting } from '@/src/services/profileService';
import type { AlarmSettingResult } from '@/src/types/api/profile';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

/**
 * 알림 설정 훅
 *
 * timeLimitAlert(시간 소진 알림)는 GET/PATCH /my-page/alarm과 동기화되는 서버 상태라
 * react-query로 관리한다. missedCallNotificationEnabled는 FE에 토글 UI가 없는 숨김
 * 필드지만 PATCH 시 백엔드가 필수로 요구해 캐시의 현재 값을 그대로 함께 전송한다.
 * eventAlert는 백엔드에 대응 개념이 없어 useNotificationStore(로컬 전용)를 그대로 쓴다.
 */
export const useNotificationSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const eventAlert = useNotificationStore((s) => s.eventAlert);
  const toggleEventAlert = useNotificationStore((s) => s.toggleEventAlert);

  const query = useQuery({
    queryKey: ['profile', 'alarmSettings'],
    queryFn: async () => (await getAlarmSetting()).result,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (nextTimeLimitAlert: boolean) => {
      // 캐시가 아직 없으면(조회 전) 숨김 필드값을 임의로 추측하지 않고 요청 자체를 막는다.
      const current = queryClient.getQueryData<AlarmSettingResult>(['profile', 'alarmSettings']);
      if (!current) {
        return Promise.reject(new Error('알림 설정을 아직 불러오지 못했습니다.'));
      }
      return modifyAlarmSetting({
        lowTimeNotificationEnabled: nextTimeLimitAlert,
        missedCallNotificationEnabled: current.missedCallNotificationEnabled,
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['profile', 'alarmSettings'], response.result);
    },
    onError: (error) => {
      showToast(getErrorDisplayMessage(error, '알림 설정 변경에 실패했습니다.'), 'error');
    },
  });

  const timeLimitAlert = query.data?.lowTimeNotificationEnabled ?? true;

  const handleToggleTimeLimit = useCallback(() => {
    if (!query.data) return; // 조회 완료 전에는 토글 자체를 막는다.
    mutation.mutate(!timeLimitAlert);
  }, [mutation, timeLimitAlert, query.data]);

  const handleToggleEvent = useCallback(() => {
    toggleEventAlert();
  }, [toggleEventAlert]);

  return {
    timeLimitAlert,
    eventAlert,
    handleToggleTimeLimit,
    handleToggleEvent,
    isTimeLimitLoading: query.isLoading || !query.data,
  };
};
