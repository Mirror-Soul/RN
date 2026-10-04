/** 서버 조회 전에는 기존 기기 음량을 유지하고, 증폭으로 왜곡되지 않게 0~1로 제한한다. */
export function normalizedPlaybackVolume(value?: number | null) {
  return value == null || !Number.isFinite(value) ? 1 : Math.min(100, Math.max(0, value)) / 100;
}
