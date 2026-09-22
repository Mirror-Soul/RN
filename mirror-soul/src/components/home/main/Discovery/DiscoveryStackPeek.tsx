import { Colors, Radii } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { Recommendation } from '@/src/types/api/home';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';

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
 * 인터랙션 없음(pointerEvents="none") — 스와이프 대상은 항상 맨 위 카드뿐이다.
 */
export default function DiscoveryStackPeek({ match, translateX, swipeThreshold }: DiscoveryStackPeekProps) {
  const { colors } = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    // 0(안 건드림) ~ 1(커밋 임계값에 도달) 사이로 드래그 진행도를 계산
    const progress = Math.min(Math.abs(translateX.value) / swipeThreshold, 1);
    return {
      opacity: progress * 0.9,
      transform: [{ scale: 0.9 + progress * 0.08 }, { translateY: (1 - progress) * 16 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.card, animatedStyle, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
    >
      {imageFailed ? (
        <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={StyleSheet.absoluteFillObject} />
      ) : (
        <Image
          source={{ uri: match.profileImageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="disk"
          onError={() => setImageFailed(true)}
        />
      )}
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
