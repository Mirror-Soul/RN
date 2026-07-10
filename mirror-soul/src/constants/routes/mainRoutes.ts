import type { BottomTabId } from '@/src/components/home/main/BottomNavbar';

export const MAIN_ROUTES = {
  HOME: '/(main)',
  HISTORY: '/(main)/history',
  GROW: '/(main)/grow',
  MATCH: '/(main)/match',
  PROFILE: '/(main)/profile',
} as const;

export type MainTabKey = 'HOME' | 'HISTORY' | 'GROW' | 'MATCH' | 'PROFILE';

/**
 * 라우트명(Tabs.Screen name) ↔ 탭ID 매핑
 * BottomNavbar의 액티브 상태 관리 및 이동 경로 계산에 사용됩니다.
 */
export const ROUTE_TO_TAB: Record<string, BottomTabId> = {
  index: 'discover',
  history: 'history',
  grow: 'grow',
  match: 'match',
  profile: 'profile',
  'voice-audio': 'profile',
  notification: 'profile',
};

export const TAB_TO_ROUTE: Record<BottomTabId, string> = {
  discover: 'index',
  history: 'history',
  grow: 'grow',
  match: 'match',
  profile: 'profile',
};
