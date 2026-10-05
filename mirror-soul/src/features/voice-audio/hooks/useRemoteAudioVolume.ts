import { useEffect } from 'react';
import type { MediaStream } from 'react-native-webrtc';
import { useAudioSettingsQuery } from './useAudioSettingsQuery';
import { receivedCallVolume } from '../playbackVolume';
import { useVoiceAudioStore } from '@/src/store/useVoiceAudioStore';
import { logger } from '@/src/utils/logger';

/** 수신 오디오만 조절한다. 마이크 입력·상대에게 전달하는 음성에는 적용하지 않는다. */
export function useRemoteAudioVolume(stream: MediaStream | null) {
  const settings = useAudioSettingsQuery();
  const gain = useVoiceAudioStore(state => state.callVoiceGain);
  const volume = receivedCallVolume(settings.data?.opponentVoiceVolume, gain);
  useEffect(() => {
    if (!stream) return;
    const apply = () => {
      for (const track of stream.getAudioTracks()) {
        try { track._setVolume(volume); }
        catch (error) { logger.warn('Could not apply received audio volume', error); }
      }
    };
    apply();
    // 기존 스트림에 수신 트랙이 추가되는 경우도 같은 설정으로 맞춘다.
    const events = stream as MediaStream & {
      addEventListener?: (type: string, listener: () => void) => void;
      removeEventListener?: (type: string, listener: () => void) => void;
    };
    events.addEventListener?.('addtrack', apply);
    return () => events.removeEventListener?.('addtrack', apply);
  }, [stream, volume]);
}
