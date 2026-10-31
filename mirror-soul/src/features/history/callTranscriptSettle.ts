/**
 * AI 통화 서버는 통화가 끝난 뒤에도 남은 발화를 백엔드 talk-logs로 마저 보낸다
 * (BACKEND_TALK_LOG_FLUSH_TIMEOUT_SECONDS 기본 10초, 5xx/네트워크 오류는 재시도). 통화 종료 REST가
 * 성공해 통화가 COMPLETED가 된 직후에도 마지막 대화가 아직 도착하지 않았을 수 있어, 이 앱에서 방금
 * 끝낸 통화는 일정 시간 동안 "대화 기록을 정리하는 중"으로 취급한다.
 */
export const TRANSCRIPT_SETTLE_WINDOW_MS = 20_000;
export const TRANSCRIPT_POLL_INTERVAL_MS = 2_500;

const endedAtByCallId = new Map<number, number>();

export const markCallEnded = (callId: number, endedAt: number = Date.now()): void => {
  for (const [id, at] of endedAtByCallId) {
    if (endedAt - at >= TRANSCRIPT_SETTLE_WINDOW_MS) endedAtByCallId.delete(id);
  }
  endedAtByCallId.set(callId, endedAt);
};

export const transcriptSettleRemainingMs = (callId: number, now: number = Date.now()): number => {
  const endedAt = endedAtByCallId.get(callId);
  if (endedAt === undefined) return 0;
  // 기기 시계가 뒤로 돌아가도 정리 구간이 창 길이를 넘어 길어지지 않게 막는다.
  return Math.min(TRANSCRIPT_SETTLE_WINDOW_MS, Math.max(0, endedAt + TRANSCRIPT_SETTLE_WINDOW_MS - now));
};
