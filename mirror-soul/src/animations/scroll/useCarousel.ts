import { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';

interface UseCarouselProps {
  scrollX: SharedValue<number>;
  index: number;
  itemWidth: number;
}

export function useCarousel({ scrollX, index, itemWidth }: UseCarouselProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const position = scrollX.value / itemWidth;
    
    // 중앙 카드 기준 크기 변화 (1.0 -> 0.9)
    const scale = interpolate(
      position,
      [index - 1, index, index + 1],
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );
    
    // 중앙 카드 기준 투명도 변화 (1.0 -> 0.5)
    const opacity = interpolate(
      position,
      [index - 1, index, index + 1],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return { animatedStyle };
}
