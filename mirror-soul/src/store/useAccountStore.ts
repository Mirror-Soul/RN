import { create } from 'zustand';

interface AccountState {
  nickname: string;
  setNickname: (name: string) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  nickname: '김소울', // Initial MVP mock data
  setNickname: (name) => set({ nickname: name }),
}));
