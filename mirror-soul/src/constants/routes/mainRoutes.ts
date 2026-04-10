export const MAIN_ROUTES = {
  HOME: '/(main)',
  HISTORY: '/(main)/history',
  GROW: '/(main)/grow',
  MATCH: '/(main)/match',
  PROFILE: '/(main)/profile',
} as const;

export type MainTabKey = 'HOME' | 'HISTORY' | 'GROW' | 'MATCH' | 'PROFILE';
