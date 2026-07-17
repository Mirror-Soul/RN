import { useActiveTheme } from '@/src/store/useThemeStore';
import { lightTheme, darkTheme, ThemeColors } from '@/src/constants/theme';

export const useThemeColors = () => {
  const activeTheme = useActiveTheme();
  const isDark = activeTheme === 'dark';
  const colors: ThemeColors = isDark ? darkTheme : lightTheme;

  return {
    colors,
    isDark,
    activeTheme,
  };
};
