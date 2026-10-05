/** 예시 가격. 서버 상품 목록·결제·환불 정책이 확정되기 전 실제 판매 가격으로 사용하지 않는다. */
export interface TimeRefillOptionData {
  id: string;
  addedTime: string;
  durationLabel: string;
  priceWon: number;
  /** POST /my-page/buy-time의 buyTime 값. 현재는 실결제 없이 시간을 추가한다. */
  seconds: number;
  badge?: string;
}

export const TIME_REFILL_OPTIONS: TimeRefillOptionData[] = [
  { id: 'opt_30m', addedTime: '30분', durationLabel: '가볍게 한 번 더', priceWon: 4900, seconds: 1800 },
  { id: 'opt_2h', addedTime: '2시간', durationLabel: '여유롭게 알아가기', priceWon: 14900, seconds: 7200, badge: '추천' },
  { id: 'opt_10h', addedTime: '10시간', durationLabel: '넉넉하게 대화하기', priceWon: 59000, seconds: 36000 },
];

export const formatRefillPrice = (priceWon: number) => `₩${priceWon.toLocaleString('ko-KR')}`;

/** 과거 판매가가 아니라, 같은 시간을 30분 예시 상품으로 채웠을 때의 비교 가격이다. */
export function getTimeRefillSavings(option: TimeRefillOptionData) {
  const base = TIME_REFILL_OPTIONS[0];
  const referencePriceWon = Math.round((option.seconds / base.seconds) * base.priceWon);
  const savingsWon = Math.max(0, referencePriceWon - option.priceWon);
  return { referencePriceWon, savingsWon, savingsPercent: referencePriceWon > 0 ? Math.round(savingsWon / referencePriceWon * 100) : 0 };
}
