import React, { createContext, useContext } from 'react';
import { Colors, darkTheme } from '@/src/constants/theme';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';

const VideoAppearance = createContext(false);

/** The live media surface is dark without changing the user's theme on other screens. */
export function CallVideoAppearance({ children }: { children: React.ReactNode }) {
  return <VideoAppearance.Provider value>{children}</VideoAppearance.Provider>;
}

export function useCallAppearance() {
  const theme = useMatchingDesign();
  const video = useContext(VideoAppearance);
  return video ? {
    ...theme,
    colors: darkTheme,
    isDark: true,
    activeTheme: 'dark' as const,
    palette: { ...theme.palette, accentInk: Colors.primary.vividPurple, cyanInk: Colors.primary.electricCyan },
  } : theme;
}
