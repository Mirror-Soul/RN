import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * 통화 상세 화면 배경의 은은한 glow 펄스 애니메이션 (message-room의 동일 패턴 재사용).
 * message-room은 배경이 항상 어두운 색으로 고정돼 있어 라이트 모드를 고려하지 않지만,
 * 이 화면은 theme-aware라 라이트 모드에서는 밝은 배경 위에 저채도 색이 탁하게 보이지 않도록
 * 최대/최소 opacity를 절반 수준으로 낮춘다.
 */
export function useCallDetailGlow(isDark: boolean) {
  const peakOpacity = isDark ? 0.16 : 0.08;
  const troughOpacity = isDark ? 0.08 : 0.04;
  const glowOpacity = useSharedValue(troughOpacity);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(peakOpacity, { duration: 2800 }),
        withTiming(troughOpacity, { duration: 2800 })
      ),
      -1,
      false
    );
  }, [glowOpacity, peakOpacity, troughOpacity]);

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
