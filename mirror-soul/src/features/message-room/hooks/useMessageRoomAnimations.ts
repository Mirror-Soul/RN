import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function useMessageRoomAnimations() {
  const glowOpacity = useSharedValue(0.1);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.16, { duration: 2800 }),
        withTiming(0.08, { duration: 2800 })
      ),
      -1,
      false
    );
  }, [glowOpacity]);

  const glowLeftStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));
  const glowRightStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.8,
  }));

  return {
    glowLeftStyle,
    glowRightStyle,
  };
}
