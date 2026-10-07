import { useContext, useEffect, useMemo, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { TabBarScrollContext } from '@/src/components/common/TabBarScrollContext';

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;
/** Only the five primary lists opt in; nested editors and horizontal cards stay independent. */
export function useMainTabScroll(route: string, enabled = true) {
  const controller = useContext(TabBarScrollContext);
  const interacting = useRef(false);
  const gestureRevision = useRef<number | null>(null);
  const settling = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacks = useMemo(() => {
    const cancelTimer = () => { if (settling.current !== null) clearTimeout(settling.current); settling.current = null; };
    const update = (event: ScrollEvent) => {
      if (!enabled) return;
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      controller?.update(route, contentOffset.y, contentSize.height - layoutMeasurement.height, interacting.current, gestureRevision.current);
    };
    return {
      scrollEventThrottle: 16,
      onScroll: update,
      onScrollBeginDrag(event: ScrollEvent) {
        cancelTimer();
        interacting.current = true;
        gestureRevision.current = enabled ? controller?.begin(route, event.nativeEvent.contentOffset.y) ?? null : null;
      },
      onScrollEndDrag(event: ScrollEvent) {
        update(event);
        cancelTimer();
        // Momentum begins just after release; allow that native event to take over.
        settling.current = setTimeout(() => { interacting.current = false; settling.current = null; }, 120);
      },
      // Programmatic animated scrolling also emits momentum events on some devices.
      onMomentumScrollBegin() { cancelTimer(); },
      onMomentumScrollEnd(event: ScrollEvent) { update(event); cancelTimer(); interacting.current = false; },
    };
  }, [controller, route, enabled]);
  useEffect(() => () => {
    if (settling.current !== null) clearTimeout(settling.current);
    settling.current = null;
    interacting.current = false;
    gestureRevision.current = null;
  }, [callbacks]);
  return callbacks;
}
