import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

export function usePulse(durationMs: number = 1000) {
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: durationMs, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: durationMs, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [durationMs, pulseAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }],
      opacity: 2 - pulseAnim.value, // 커질수록 투명해지게 (1.5 -> 0.5 opacity)
    };
  });

  return { animatedStyle };
}
