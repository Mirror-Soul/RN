import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAlarmSetting, modifyAlarmSetting } from '@/src/services/profileService';
import type { AlarmSettingResult } from '@/src/types/api/profile';
import { useAuthStore } from '@/src/store/useAuthStore';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

type AlarmField = keyof AlarmSettingResult;
/** 서버의 두 알림 설정을 노출한다. 서버 계약이 없는 이벤트 수신 설정은 제공하지 않는다. */
export const useNotificationSettings = () => {
  const client = useQueryClient();
  const { showToast } = useToast();
  const userUuid = useAuthStore(s => s.userUuid);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const lock = useRef(false);
  const query = useQuery({
    queryKey: profileQueryKeys.alarmSettings(userUuid),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getAlarmSetting(signal)).result;
    },
    staleTime: 60_000,
    enabled: isLoggedIn && !!userUuid,
  });
  const mutation = useMutation({
    onMutate: ({ userUuid }: { userUuid: string; field: AlarmField }) => client.cancelQueries({ queryKey: profileQueryKeys.alarmSettings(userUuid) }),
    mutationFn: ({ userUuid, field }: { userUuid: string; field: AlarmField }) => {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      const current = client.getQueryData<AlarmSettingResult>(profileQueryKeys.alarmSettings(userUuid));
      if (!current) throw new Error('알림 설정을 먼저 불러와 주세요.');
      return modifyAlarmSetting({
        lowTimeNotificationEnabled: field === 'lowTimeNotificationEnabled' ? !current.lowTimeNotificationEnabled : current.lowTimeNotificationEnabled,
        missedCallNotificationEnabled: field === 'missedCallNotificationEnabled' ? !current.missedCallNotificationEnabled : current.missedCallNotificationEnabled,
      });
    },
    onSuccess: async (response, { userUuid }) => {
      if (useAuthStore.getState().userUuid !== userUuid || !useAuthStore.getState().isLoggedIn) return;
      await client.cancelQueries({ queryKey: profileQueryKeys.alarmSettings(userUuid) });
      if (useAuthStore.getState().isLoggedIn && useAuthStore.getState().userUuid === userUuid) client.setQueryData(profileQueryKeys.alarmSettings(userUuid), response.result);
    },
    onError: (error, { userUuid }) => {
      if (useAuthStore.getState().userUuid === userUuid) showToast(getErrorDisplayMessage(error, '알림 설정을 저장하지 못했어요.'), 'error');
    },
    onSettled: () => { lock.current = false; },
  });
  const toggle = (field: AlarmField) => {
    const session = useAuthStore.getState();
    if (lock.current || !query.data || !userUuid || !session.isLoggedIn || session.userUuid !== userUuid) return;
    lock.current = true;
    mutation.mutate({ userUuid, field });
  };
  return {
    ...query,
    timeLimitAlert: query.data?.lowTimeNotificationEnabled ?? false,
    missedCallAlert: query.data?.missedCallNotificationEnabled ?? false,
    handleToggleTimeLimit: () => toggle('lowTimeNotificationEnabled'),
    handleToggleMissedCall: () => toggle('missedCallNotificationEnabled'),
    isSaving: mutation.isPending,
    savingField: mutation.isPending ? mutation.variables?.field : undefined,
  };
};
