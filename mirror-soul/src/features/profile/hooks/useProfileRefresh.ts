import { useCallback } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

/** 화면에 머물 때 최대 90초만 확인한다. 파일 부재를 학습 중이라고 단정하지 않는다. */
export function useProfileRefresh(refresh: () => Promise<unknown>, watchForUpdates = false, enabled = true) {
  useFocusEffect(useCallback(() => {
    if (!enabled) return;
    let active = true;
    let fetching = false;
    const deadline = Date.now() + 90_000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const clearTimer = () => { if (timer) clearTimeout(timer); timer = undefined; };
    const schedule = () => {
      clearTimer();
      if (active && watchForUpdates && AppState.currentState === 'active' && Date.now() + 15_000 <= deadline) {
        timer = setTimeout(() => { void run(); }, 15_000);
      }
    };
    const run = async () => {
      if (!active || fetching || AppState.currentState !== 'active') return;
      fetching = true;
      try { await refresh(); }
      catch { /* 조회 훅의 오류 UI에서 복구한다. */ }
      finally { fetching = false; schedule(); }
    };
    void run();
    const subscription = AppState.addEventListener('change', state => {
      clearTimer();
      if (state === 'active') void run();
    });
    return () => { active = false; clearTimer(); subscription.remove(); };
  }, [enabled, refresh, watchForUpdates]));
}
