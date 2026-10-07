export type TabBarScrollDecision = 'expand' | 'compact' | null;

/** Clamped offsets prevent iOS bounce and Android overscroll from reversing direction. */
export function createTabBarScrollTracker() {
  let previous: number | null = null;
  let extent: number | null = null;
  let direction = 0;
  let distance = 0;
  const reset = (offset: number | null = null) => {
    previous = offset;
    extent = null;
    direction = 0;
    distance = 0;
  };
  return {
    reset,
    update(offset: number, maxOffset: number, userScrolling: boolean): TabBarScrollDecision {
      if (!Number.isFinite(offset) || !Number.isFinite(maxOffset)) return null;
      const max = Math.max(0, maxOffset);
      const y = Math.max(0, Math.min(max, offset));
      const resized = extent !== null && Math.abs(extent - max) > 1;
      extent = max;
      const delta = previous === null ? 0 : y - Math.max(0, Math.min(max, previous));
      previous = y;
      // Always offer navigation at the top/end, on short content and after reflow.
      if (max <= 24 || y <= 12 || y >= max - 4 || resized) {
        direction = 0;
        distance = 0;
        return 'expand';
      }
      // Focus restoration, list refresh and scrollToOffset are not user intent.
      if (!userScrolling) { direction = 0; distance = 0; return null; }
      if (delta === 0) return null;
      const nextDirection = delta > 0 ? 1 : -1;
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;
      const threshold = direction > 0 ? 36 : 12;
      if (distance < threshold) return null;
      distance = 0;
      return direction > 0 ? 'compact' : 'expand';
    },
  };
}
