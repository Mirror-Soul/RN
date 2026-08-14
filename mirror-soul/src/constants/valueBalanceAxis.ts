import type { ValueBalanceAxis } from '@/src/types/api/evolve';

/** 가치관 밸런스 게임 축(axis)의 사용자 노출용 한글 라벨 */
export const VALUE_BALANCE_AXIS_LABELS: Record<ValueBalanceAxis, string> = {
  LOVE: '연애관',
  LIFESTYLE: '라이프스타일',
  COMM: '소통 방식',
  DECISION: '의사결정',
  SOCIAL: '사회성',
  PRIORITY: '우선순위',
  TONE: '성향',
  TASTE: '취향',
};
