import { useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';

/** Preserve the existing growth tab and its scroll position; ignore rapid repeated exits. */
export function useGrowthReturn() {
  const router = useRouter();
  const exiting = useRef(false);
  return useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    if (router.canGoBack()) router.back();
    else router.dismissTo('/(main)/grow');
  }, [router]);
}
