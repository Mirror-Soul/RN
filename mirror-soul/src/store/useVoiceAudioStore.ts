import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type SpeedOption = 'slow' | 'normal' | 'fast';
export type CallVoiceGain = 1 | 1.5 | 2;

interface VoiceAudioState {
  speechSpeed: SpeedOption;
  setSpeechSpeed: (speed: SpeedOption) => void;
  /** Device-only received call gain; not a server volume or microphone setting. */
  callVoiceGain: CallVoiceGain;
  setCallVoiceGain: (gain: CallVoiceGain) => void;
}

/**
 * expo-secure-store 기반 Zustand persist 어댑터
 * (프로젝트에 @react-native-async-storage가 미설치 → SecureStore 활용)
 */
const secureStorage = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

/**
 * speechSpeed 서버 설정의 로컬 미러와 기기별 통화 음량 배율.
 * 진실의 원천은 react-query 캐시(['profile','audioSettings'], useVoiceAudioSettings.ts 참고)이고,
 * callVoiceGain은 서버 대응 필드가 없는 로컬 설정으로 수신 통화 트랙에만 적용한다.
 */
export const useVoiceAudioStore = create<VoiceAudioState>()(
  persist(
    (set) => ({
      speechSpeed: 'normal',
      setSpeechSpeed: (speed) => set({ speechSpeed: speed }),
      callVoiceGain: 1,
      setCallVoiceGain: (gain) => {
        if (gain === 1 || gain === 1.5 || gain === 2) set({ callVoiceGain: gain });
      },
    }),
    {
      name: 'voice-audio-settings',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
