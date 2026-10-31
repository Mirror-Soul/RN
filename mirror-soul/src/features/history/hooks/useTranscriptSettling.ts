import { useEffect, useReducer } from 'react';
import { transcriptSettleRemainingMs } from '../callTranscriptSettle';

/** 방금 끝낸 통화의 대화 기록이 아직 서버에서 오는 중인지. 정리 구간이 끝나는 순간 false로 바뀐다. */
export const useTranscriptSettling = (callId: number): boolean => {
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const settling = transcriptSettleRemainingMs(callId) > 0;

  useEffect(() => {
    const remaining = transcriptSettleRemainingMs(callId);
    if (remaining <= 0) return undefined;
    // 타이머가 아주 조금 일찍 깨어나도 마지막 렌더가 '정리 중'으로 남지 않게 여유를 둔다.
    const timer = setTimeout(rerender, remaining + 50);
    return () => clearTimeout(timer);
  }, [callId]);

  return settling;
};
