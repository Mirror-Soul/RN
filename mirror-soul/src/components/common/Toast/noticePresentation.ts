export type NoticeType = 'success' | 'error' | 'info';

/** Brief confirmations; longer errors and large text get more reading time. */
export function noticeDuration(message: string, type: NoticeType, fontScale: number) {
  const base = type === 'error' ? 6000 : type === 'info' ? 5000 : 4000;
  const scale = Number.isFinite(fontScale) ? Math.max(1, fontScale) : 1;
  return Math.min(12000, Math.round((base + Math.max(0, Array.from(message).length - 30) * 45) * scale));
}
