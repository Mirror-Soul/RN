import { useSharedValue, useAnimatedScrollHandler, SharedValue } from 'react-native-reanimated';
import type { NativeScrollEvent } from 'react-native';

export function useTrackScroll() {
  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      scrollY.value = event.contentOffset.y;
    },
  });

  return { scrollX, scrollY, scrollHandler };
}
