import { useThemeColors } from '@/src/hooks/useThemeColors';

/** Keep labels, guidance and entered text distinct on signup cards in both themes. */
export function useSignupFieldColors() {
  const { isDark, colors } = useThemeColors();
  return {
    label: isDark ? '#C3CAD5' : colors.text.secondary,
    hint: isDark ? '#A8B1C0' : '#536072',
    placeholder: isDark ? '#929CAA' : '#667085',
    inputBackground: isDark ? '#1D2026' : '#F6F7FA',
    border: isDark ? '#46505E' : '#D6DCE5',
  };
}
