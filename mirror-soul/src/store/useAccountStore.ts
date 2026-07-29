import { create } from 'zustand';
import { getMyProfile } from '../services/profileService';
import { logger } from '../utils/logger';

interface AccountState {
  nickname: string;
  email: string | null;
  setNickname: (name: string) => void;
  /** GET /my-page 호출 후 이름/이메일을 반영. 실패 시 조용히 무시(기존 값 유지). */
  fetchProfile: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set) => ({
  nickname: '김소울', // Initial MVP mock data
  email: null,
  setNickname: (name) => set({ nickname: name }),
  fetchProfile: async () => {
    try {
      const response = await getMyProfile();
      if (response.isSuccess) {
        set({ nickname: response.result.name, email: response.result.email });
      }
    } catch (error) {
      logger.error('useAccountStore: fetchProfile failed', error);
    }
  },
}));
