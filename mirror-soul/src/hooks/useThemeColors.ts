import { createContext, useContext } from 'react';
import { useActiveTheme } from '@/src/store/useThemeStore';
import { lightTheme, darkTheme, ThemeColors } from '@/src/constants/theme';

/**
 * 배경이 라이트/다크 설정과 무관하게 항상 고정된 화면(예: 회원가입 플로우)에서
 * 텍스트 색상도 항상 다크 테마를 따르도록 강제하기 위한 컨텍스트.
 */
export const ForceDarkThemeContext = createContext(false);

export const useThemeColors = () => {
  const activeTheme = useActiveTheme();
  const forceDark = useContext(ForceDarkThemeContext);
  const isDark = forceDark || activeTheme === 'dark';
  const colors: ThemeColors = isDark ? darkTheme : lightTheme;

  return {
    colors,
    isDark,
    activeTheme: forceDark ? 'dark' : activeTheme,
  };
};
