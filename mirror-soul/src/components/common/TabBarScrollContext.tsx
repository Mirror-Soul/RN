import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { createTabBarScrollTracker } from '@/src/components/home/main/tabBarScrollPolicy';

type ScrollController = {
  activate: (route: string) => void;
  begin: (route: string, offset: number) => number | null;
  update: (route: string, offset: number, maxOffset: number, userScrolling: boolean, gestureRevision: number | null) => void;
};
export const TabBarScrollContext = createContext<ScrollController | null>(null);
export const TabBarCompactContext = createContext(false);

/** Methods stay stable: scroll frames never rerender screens or the tab navigator. */
export function TabBarScrollProvider({ children }: { children: React.ReactNode }) {
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);
  const routeRef = useRef('index');
  const revision = useRef(0);
  const screenReader = useRef(false);
  const tracker = useRef(createTabBarScrollTracker());
  const controller = useMemo<ScrollController>(() => {
    const apply = (nextCompact: boolean) => {
      if (compactRef.current === nextCompact) return;
      compactRef.current = nextCompact;
      setCompact(nextCompact);
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
        if (decision !== null) apply(decision === 'compact');
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
    <TabBarCompactContext.Provider value={compact}>{children}</TabBarCompactContext.Provider>
  </TabBarScrollContext.Provider>;
}
