import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from 'react-native-reanimated';
import {Colors, Radii, Spacing} from '@/src/constants/theme';

interface MatchingCarouselIndicatorProps {
  data: any[];
  scrollX: SharedValue<number>;
  itemWidth: number;
}

export default function MatchingCarouselIndicator({ data, scrollX, itemWidth }: MatchingCarouselIndicatorProps) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      {data.map((_, index) => {
        const animatedDotStyle = useAnimatedStyle(() => {
          const position = scrollX.value / itemWidth;

          // 현재 활성화된 인덱스일 때 너비를 길게 늘려 활성 상태 표시
          const width = interpolate(
            position,
            [index - 1, index, index + 1],
            [6, 20, 6],
            Extrapolation.CLAMP
          );

          // 현재 활성화된 인덱스일 때 불투명도 조절
          const opacity = interpolate(
            position,
            [index - 1, index, index + 1],
            [0.3, 1, 0.3],
            Extrapolation.CLAMP
          );

          return {
            width,
            opacity,
          };
        });

        return (
          <Animated.View
            key={`indicator-${index}`}
            style={[styles.dot, animatedDotStyle]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    height: 10, // 컨테이너 높이 명시적 고정 (세로 떨림/밀림 방지)
  },
  dot: {
    height: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
    marginHorizontal: 3, // gap 대신 margin 사용으로 호환성 확보
    alignSelf: 'center', // 세로 중앙 정렬 강제
  },
});
