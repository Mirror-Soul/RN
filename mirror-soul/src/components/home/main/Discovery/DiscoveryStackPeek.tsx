import { Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { Recommendation } from '@/src/types/api/home';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import DiscoveryCardContent from './DiscoveryCardContent';

interface DiscoveryStackPeekProps {
  match: Recommendation;
  /** 위 카드(DiscoveryMatchCard)와 공유하는 같은 드래그 값 — 평소엔 0이라 이 카드가
      거의 안 보이다가, 위 카드를 드래그한 만큼만 실시간으로 드러난다. */
  translateX: SharedValue<number>;
  swipeThreshold: number;
}

/**
 * DiscoveryStackPeek 컴포넌트 (SRP)
 * 다음 후보 카드 — 평소(드래그 안 할 때)엔 뒤에 숨어 거의 안 보이다가, 위 카드를
 * 옆으로 미는 만큼만 살짝 드러난다(항상 뚜렷하게 보이는 정적 스택이 아님).
 * 내용 자체는 DiscoveryCardContent를 그대로 재사용(DiscoveryMatchCard와 항상
 * 동일하게 유지됨) — 여기서는 진행도 기반 변환만 감싼다. 콜백을 하나도 안 넘겨서
 * 모든 터치 요소가 반응 없는 View로 렌더링되고(어차피 밖의 pointerEvents="none"이
 * 전부 막아줌), showPhotoOverlays/summaryExpandable도 기본값 false로 chevron·
 * 더보기 토글 없이 표시된다.
 */
export default function DiscoveryStackPeek({ match, translateX, swipeThreshold }: DiscoveryStackPeekProps) {
  const { colors } = useThemeColors();

  const animatedStyle = useAnimatedStyle(() => {
    // 0(안 건드림) ~ 1(커밋 임계값에 도달) 사이로 드래그 진행도를 계산
    const progress = Math.min(Math.abs(translateX.value) / swipeThreshold, 1);
    return {
      // 내용이 실카드에 가까운 만큼, 최대 노출 강도는 오히려 낮춰서 앞 카드보다
      // 항상 옅게 유지한다 — 다 드러나도 "배경"으로 읽히게.
      opacity: progress * 0.75,
      transform: [{ scale: 0.88 + progress * 0.08 }, { translateY: (1 - progress) * 16 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.card, animatedStyle, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}
    >
      <DiscoveryCardContent match={match} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Radii.xxl,
    overflow: 'hidden',
    borderWidth: 1,
  },
});
