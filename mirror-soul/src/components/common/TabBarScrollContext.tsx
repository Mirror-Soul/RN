import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { createTabBarScrollTracker } from '@/src/components/home/main/tabBarScrollPolicy';

type ScrollController = {
  activate: (route: string) => void;
  begin: (route: string, offset: number) => number | null;
  update: (route: string, offset: number, maxOffset: number, userScrolling: boolean, gestureRevision: number | null) => void;
};
export const TabBarScrollContext = createContext<ScrollController | null>(null);
export const TabBarHiddenContext = createContext(false);

/** Methods stay stable: scroll frames never rerender screens or the tab navigator. */
export function TabBarScrollProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);
  const routeRef = useRef('index');
  const revision = useRef(0);
  const screenReader = useRef(false);
  const tracker = useRef(createTabBarScrollTracker());
  const controller = useMemo<ScrollController>(() => {
    const apply = (nextHidden: boolean) => {
      if (hiddenRef.current === nextHidden) return;
      hiddenRef.current = nextHidden;
      setHidden(nextHidden);
    };
    return {
      activate(route) { revision.current += 1; routeRef.current = route; tracker.current.reset(); apply(false); },
      begin(route, offset) {
        if (routeRef.current !== route) return null;
        tracker.current.reset(offset);
        return revision.current;
      },
      update(route, offset, maxOffset, userScrolling, gestureRevision) {
        if (routeRef.current !== route) return;
        if (screenReader.current) { apply(false); return; }
        const decision = tracker.current.update(offset, maxOffset, userScrolling && gestureRevision === revision.current);
        if (decision !== null) apply(decision === 'hide');
      },
    };
  }, []);

  useEffect(() => {
    let current = true;
    let changed = false;
    const update = (enabled: boolean) => {
      screenReader.current = enabled;
      if (enabled) controller.activate(routeRef.current);
    };
    const listener = AccessibilityInfo.addEventListener('screenReaderChanged', enabled => { changed = true; update(enabled); });
    void AccessibilityInfo.isScreenReaderEnabled().then(enabled => { if (current && !changed) update(enabled); }, () => {});
    return () => { current = false; listener.remove(); };
  }, [controller]);

  return <TabBarScrollContext.Provider value={controller}>
    <TabBarHiddenContext.Provider value={hidden}>{children}</TabBarHiddenContext.Provider>
  </TabBarScrollContext.Provider>;
}
