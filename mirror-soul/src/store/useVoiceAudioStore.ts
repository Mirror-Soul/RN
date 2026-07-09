import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type SpeedOption = 'slow' | 'normal' | 'fast';

interface VoiceAudioState {
  speechSpeed: SpeedOption;
  setSpeechSpeed: (speed: SpeedOption) => void;
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
 * 음성 및 오디오 설정 스토어
 *
 * - speechSpeed: AI 상대방의 말하기 속도 설정
 * - persist 미들웨어로 SecureStore에 영속화 (앱 재시작 후에도 유지)
 * - 추후 useAICallFlow.ts의 CALL_INVITE 메시지에 speechSpeed 파라미터로 전달 예정
 */
export const useVoiceAudioStore = create<VoiceAudioState>()(
  persist(
    (set) => ({
      speechSpeed: 'normal',
      setSpeechSpeed: (speed) => set({ speechSpeed: speed }),
    }),
    {
      name: 'voice-audio-settings',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
