/** 로컬 인덱스가 이 값만큼 남으면 다음 페이지를 미리 요청한다 */
export const PREFETCH_THRESHOLD = 3;

/** 남은 카드 수가 임계값 이하이고 다음 페이지가 있고 이미 요청 중이 아닐 때만 true */
export function shouldPrefetchNextPage(params: {
  currentIndex: number;
  loadedCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}): boolean {
  const { currentIndex, loadedCount, hasNextPage, isFetchingNextPage } = params;
  return hasNextPage && !isFetchingNextPage && currentIndex >= loadedCount - PREFETCH_THRESHOLD;
}
