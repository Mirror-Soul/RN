/** 백엔드 LocalDateTime ISO 문자열을 "n분 전"/"n시간 전" 같은 상대 시간 레이블로 변환. */
export function formatRelativeTime(isoDateTime: string): string {
  const target = new Date(isoDateTime).getTime();
  const diffMinutes = Math.floor((Date.now() - target) / 60_000);

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  const date = new Date(target);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}
