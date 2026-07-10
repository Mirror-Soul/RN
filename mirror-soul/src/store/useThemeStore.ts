import { create } from 'zustand';
import { useColorScheme } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'system', // 기본값
  setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
}));

/**
 * 컴포넌트 렌더링 시 현재 활성화된 테마('light' | 'dark')를 반환하는 헬퍼 훅
 */
export const useActiveTheme = () => {
  const { themeMode } = useThemeStore();
  const systemTheme = useColorScheme() || 'dark'; // fallback to dark

  if (themeMode === 'system') return systemTheme;
  return themeMode;
};
