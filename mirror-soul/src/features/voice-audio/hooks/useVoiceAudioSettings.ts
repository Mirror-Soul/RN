import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAudioSettings, updateAudioSettings } from '@/src/services/profileService';
import type { AudioSettingsResult, SpeechSpeed } from '@/src/types/api/profile';
import { SpeedOption, useVoiceAudioStore } from '@/src/store/useVoiceAudioStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

const SPEED_OPTION_BY_SPEECH_SPEED: Record<SpeechSpeed, SpeedOption> = {
  SLOW: 'slow',
  NORMAL: 'normal',
  FAST: 'fast',
};

const SPEECH_SPEED_BY_SPEED_OPTION: Record<SpeedOption, SpeechSpeed> = {
  slow: 'SLOW',
  normal: 'NORMAL',
  fast: 'FAST',
};

/**
 * 음성 및 오디오 설정 훅
 *
 * GET/PATCH /my-page/audio-settings를 react-query로 감싼다.
 * opponentVoiceVolume은 FE에 조절 UI가 없는 숨김 필드라, PATCH 시 캐시에 있는
 * 현재 값을 그대로 함께 전송한다(백엔드가 두 필드 모두 필수로 요구).
 * 성공 시 useVoiceAudioStore에도 speechSpeed를 미러링해 useAICallFlow.ts가
 * 훅 없이 동기적으로 읽을 수 있게 한다.
 */
export const useVoiceAudioSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const mirroredSpeed = useVoiceAudioStore((s) => s.speechSpeed);
  const setMirroredSpeed = useVoiceAudioStore((s) => s.setSpeechSpeed);

  const query = useQuery({
    queryKey: ['profile', 'audioSettings'],
    queryFn: async () => (await getAudioSettings()).result,
    staleTime: 60_000,
    enabled: isLoggedIn,
  });

  const mutation = useMutation({
    mutationFn: (speed: SpeedOption) => {
      // 캐시가 아직 없으면(조회 전) 숨김 필드값을 임의로 추측하지 않고 요청 자체를 막는다.
      const current = queryClient.getQueryData<AudioSettingsResult>(['profile', 'audioSettings']);
      if (!current) {
        return Promise.reject(new Error('음성 설정을 아직 불러오지 못했습니다.'));
      }
      return updateAudioSettings({
        opponentVoiceVolume: current.opponentVoiceVolume,
        opponentSpeechSpeed: SPEECH_SPEED_BY_SPEED_OPTION[speed],
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(['profile', 'audioSettings'], response.result);
      setMirroredSpeed(SPEED_OPTION_BY_SPEECH_SPEED[response.result.opponentSpeechSpeed]);
    },
    onError: (error) => {
      showToast(getErrorDisplayMessage(error, '음성 설정 변경에 실패했습니다.'), 'error');
    },
  });

  const speechSpeed = query.data ? SPEED_OPTION_BY_SPEECH_SPEED[query.data.opponentSpeechSpeed] : mirroredSpeed;

  const handleSpeedChange = useCallback(
    (speed: SpeedOption) => {
      if (!query.data) return; // 조회 완료 전에는 변경 자체를 막는다.
      mutation.mutate(speed);
    },
    [mutation, query.data]
  );

  return {
    speechSpeed,
    handleSpeedChange,
    isLoading: query.isLoading || !query.data,
  };
};
