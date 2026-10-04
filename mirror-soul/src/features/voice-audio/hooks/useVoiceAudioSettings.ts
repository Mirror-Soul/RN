import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAudioSettings } from '@/src/services/profileService';
import type { AudioSettingsResult } from '@/src/types/api/profile';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';
import { useAudioSettingsQuery } from './useAudioSettingsQuery';

/** 기존 볼륨 API를 활용한다. 화면에서 제거한 속도 값은 PATCH에 그대로 보존한다. */
export const useVoiceAudioSettings = () => {
  const client = useQueryClient();
  const userUuid = useAuthStore(state => state.userUuid);
  const query = useAudioSettingsQuery();
  const { showToast } = useToast();
  const lock = useRef(false);
  const mutation = useMutation({
    onMutate: ({ userUuid }: { userUuid: string; volume: number }) => client.cancelQueries({ queryKey: profileQueryKeys.audioSettings(userUuid) }),
    mutationFn: ({ userUuid, volume }: { userUuid: string; volume: number }) => {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      const current = client.getQueryData<AudioSettingsResult>(profileQueryKeys.audioSettings(userUuid));
      if (!current) throw new Error('오디오 설정을 먼저 불러와 주세요.');
      return updateAudioSettings({ opponentVoiceVolume: volume, opponentSpeechSpeed: current.opponentSpeechSpeed });
    },
    onSuccess: async (response, { userUuid }) => {
      if (useAuthStore.getState().userUuid !== userUuid || !useAuthStore.getState().isLoggedIn) return;
      await client.cancelQueries({ queryKey: profileQueryKeys.audioSettings(userUuid) });
      if (useAuthStore.getState().userUuid !== userUuid || !useAuthStore.getState().isLoggedIn) return;
      client.setQueryData(profileQueryKeys.audioSettings(userUuid), response.result);
    },
    onError: (error, { userUuid }) => {
      if (useAuthStore.getState().userUuid === userUuid) showToast(getErrorDisplayMessage(error, '목소리 크기를 저장하지 못했어요.'), 'error');
    },
    onSettled: () => { lock.current = false; },
  });
  const handleVolumeChange = (volume: number) => {
    const session = useAuthStore.getState();
    if (lock.current || !userUuid || !session.isLoggedIn || session.userUuid !== userUuid || !query.data || !Number.isFinite(volume)) return;
    const next = Math.round(Math.min(100, Math.max(0, volume)));
    if (next === query.data.opponentVoiceVolume) return;
    lock.current = true;
    mutation.mutate({ userUuid, volume: next });
  };
  return { ...query, volume: query.data?.opponentVoiceVolume ?? null, handleVolumeChange, isSaving: mutation.isPending };
};
