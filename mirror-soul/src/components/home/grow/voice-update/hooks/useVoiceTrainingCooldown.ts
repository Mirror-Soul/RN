import { useEffect, useState } from 'react';

/** 백엔드 VoiceTrainingJobService.VOICE_UPDATE_COOLDOWN_MINUTES와 동일한 값. */
const COOLDOWN_MS = 2 * 60 * 1000;

/**
 * 마지막 목소리 학습 시각(twinSync.lastVoiceTrainingAt) 기준으로 2분 쿨다운이
 * 남았는지, 몇 초 남았는지 1초마다 갱신해 알려준다.
 *
 * 쿨다운 중에 녹음을 시작하면 STT+업로드까지 다 끝낸 뒤에야 백엔드가
 * VOICE_TRAINING_TOO_FREQUENT(429)로 거부한다 — 이 훅으로 녹음 시작 전에 미리 막는다.
 */
export function useVoiceTrainingCooldown(lastVoiceTrainingAt: string | null | undefined) {
  const cooldownEndsAt = lastVoiceTrainingAt
    ? new Date(lastVoiceTrainingAt).getTime() + COOLDOWN_MS
    : null;

  const [remainingMs, setRemainingMs] = useState(() =>
    cooldownEndsAt ? Math.max(0, cooldownEndsAt - Date.now()) : 0
  );

  useEffect(() => {
    if (!cooldownEndsAt) {
      setRemainingMs(0);
      return;
    }

    const tick = () => setRemainingMs(Math.max(0, cooldownEndsAt - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndsAt]);

  return {
    isInCooldown: remainingMs > 0,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  };
}
