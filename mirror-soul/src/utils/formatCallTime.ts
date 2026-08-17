/** 초 단위 값을 HH:MM:SS 형식으로 포맷. 여러 화면(홈/마이페이지)에서 공통으로 사용. */
export function formatCallTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** 초 단위 값을 "N분 M초" 형식으로 포맷. 통화 기록 카드 등에서 사용. null이면 "-". */
export function formatDurationLabel(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null) return '-';
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}분 ${seconds}초`;
}
