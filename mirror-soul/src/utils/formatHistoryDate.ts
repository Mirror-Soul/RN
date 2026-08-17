/** 백엔드 LocalDate("YYYY-MM-DD")를 "오늘"/"어제"/"N월 N일" 상대 레이블로 변환. */
export function toRelativeDateLabel(isoDate: string): string {
  const target = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  return `${target.getMonth() + 1}월 ${target.getDate()}일`;
}

/** 백엔드 LocalDateTime ISO 문자열을 "HH:mm" 시간 레이블로 변환. */
export function toTimeLabel(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
