import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** 백엔드 VoiceTrainingJobService.VOICE_UPDATE_COOLDOWN_MINUTES와 동일한 값. */
const COOLDOWN_MS = 2 * 60 * 1000;

/**
 * 마지막 목소리 학습 시각(twinSync.lastVoiceTrainingAt) 기준으로 2분 쿨다운이
 * 남았는지, 몇 초 남았는지 1초마다 갱신해 알려준다.
 *
 * 쿨다운 중에 녹음을 시작하면 STT+업로드까지 다 끝낸 뒤에야 백엔드가
 * VOICE_TRAINING_TOO_FREQUENT(429)로 거부한다 — 이 훅으로 녹음 시작 전에 미리 막는다.
 */
export function useVoiceTrainingCooldown(lastVoiceTrainingAt: string | null | undefined, locallyAcceptedAt?: number) {
  // Offset-less backend timestamps follow the app's Korean service-time convention.
  const serverTime = lastVoiceTrainingAt
    ? new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(lastVoiceTrainingAt) ? lastVoiceTrainingAt : `${lastVoiceTrainingAt}+09:00`).getTime()
    : NaN;
  const latestTime = Math.max(Number.isFinite(serverTime) ? serverTime : 0, locallyAcceptedAt ?? 0);
  const cooldownEndsAt = latestTime > 0 ? latestTime + COOLDOWN_MS : null;

  const [, setNow] = useState(Date.now);
  // Compute with the new deadline immediately; never show an enabled next button for one render.
  const remainingMs = cooldownEndsAt ? Math.max(0, cooldownEndsAt - Date.now()) : 0;

  useEffect(() => {
    if (!cooldownEndsAt || cooldownEndsAt <= Date.now()) return;
    const tick = () => {
      setNow(Date.now());
      if (Date.now() >= cooldownEndsAt) clearInterval(interval);
    };
    const interval = setInterval(tick, 1000);
    const foreground = AppState.addEventListener('change', state => { if (state === 'active') tick(); });
    return () => { clearInterval(interval); foreground.remove(); };
  }, [cooldownEndsAt]);

  return {
    isInCooldown: remainingMs > 0,
    remainingSeconds: Math.ceil(remainingMs / 1000),
  };
}
