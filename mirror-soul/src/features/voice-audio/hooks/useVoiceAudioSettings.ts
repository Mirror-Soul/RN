import { useCallback, useEffect } from 'react';
import { SpeedOption, useVoiceAudioStore } from '../../../store/useVoiceAudioStore';

/**
 * 음성 및 오디오 설정 훅
 *
 * Zustand 스토어를 감싸 컴포넌트에 깔끔한 인터페이스를 제공합니다.
 * 컴포넌트는 이 훅만 사용하고, 스토어 구조를 직접 알 필요가 없습니다.
 */
export const useVoiceAudioSettings = () => {
  const speechSpeed = useVoiceAudioStore((s) => s.speechSpeed);
  const fetchAudioSettings = useVoiceAudioStore((s) => s.fetchAudioSettings);
  const syncSpeechSpeed = useVoiceAudioStore((s) => s.syncSpeechSpeed);

  useEffect(() => {
    fetchAudioSettings();
  }, [fetchAudioSettings]);

  const handleSpeedChange = useCallback(
    (speed: SpeedOption) => {
      syncSpeechSpeed(speed);
    },
    [syncSpeechSpeed]
  );

  return {
    speechSpeed,
    handleSpeedChange,
  };
};
