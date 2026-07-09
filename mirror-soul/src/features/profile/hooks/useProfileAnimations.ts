import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

/**
 * 터치 시 쫀득한 Scale 효과를 주는 애니메이션 훅
 */
export const usePressAnimation = () => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, {
      mass: 0.5,
      damping: 15,
      stiffness: 150,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      mass: 0.5,
      damping: 10,
      stiffness: 150,
    });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return {
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
};

/**
 * 대화 가능한 시간 배경 그라디언트에 펄스(숨쉬는) 효과를 주는 훅
 */
export const usePulseAnimation = () => {
  const opacity = useSharedValue(0.4);

  // 컴포넌트 마운트 시 호출하여 무한 반복
  const startPulse = useCallback(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1, // 무한 반복
      true // reverse
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return {
    startPulse,
    animatedStyle,
  };
};
