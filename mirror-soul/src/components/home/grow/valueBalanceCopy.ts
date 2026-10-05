/** lockedUntil is a backend LocalDateTime measured in Asia/Seoul, not the device time zone. */
export function valueBalanceUnlockLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}+09:00`);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)?.value;
  return `${part('month')}/${part('day')} ${part('hour')}:${part('minute')}`;
}
