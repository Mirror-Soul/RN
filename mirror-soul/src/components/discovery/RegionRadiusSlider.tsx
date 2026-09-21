import { Colors } from '@/src/constants/theme';
import React, { useCallback, useEffect, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface RegionRadiusSliderProps {
  /** 왼쪽(가까운 동네)부터 오른쪽(먼 동네) 순으로 나열한 고정 단계 값. 예: [1, 10, 30, 50] */
  steps: number[];
  value: number;
  onValueChange: (value: number) => void;
}

const THUMB_SIZE = 24;
const TICK_SIZE = 6;

/**
 * "가까운 동네 ↔ 먼 동네" 반경 슬라이더 — 연속값이 아니라 steps 배열의 고정 지점에만 멈추는
 * 4단계(당근마켓 참고 이미지와 동일한 구조) 스냅 슬라이더다. 드래그 중에도 가장 가까운
 * 단계로 즉시 스냅해서 "몇 단계 중 몇 번째"라는 느낌을 명확히 준다.
 * 별도 네이티브 슬라이더 라이브러리 없이 이미 검증된 gesture-handler + reanimated로 구현했다.
 */
export default function RegionRadiusSlider({ steps, value, onValueChange }: RegionRadiusSliderProps) {
  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0);
  const stepCount = steps.length;

  const indexToX = useCallback(
    (index: number, width: number) => {
      'worklet';
      if (stepCount <= 1 || width <= 0) return 0;
      return (index / (stepCount - 1)) * (width - THUMB_SIZE);
    },
    [stepCount]
  );

  const currentIndex = useMemo(() => {
    const index = steps.indexOf(value);
    return index === -1 ? 0 : index;
  }, [steps, value]);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      trackWidth.value = width;
      thumbX.value = indexToX(currentIndex, width);
    },
    [currentIndex, indexToX, trackWidth, thumbX]
  );

  // 슬라이더 밖(초기 로드, 검색으로 앵커 변경 등)에서 value가 바뀌면 썸 위치도 따라간다.
  useEffect(() => {
    if (trackWidth.value > 0) {
      thumbX.value = withSpring(indexToX(currentIndex, trackWidth.value), { damping: 20, stiffness: 220 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const notifyChange = useCallback(
    (index: number) => {
      onValueChange(steps[index]);
    },
    [steps, onValueChange]
  );

  const updateFromX = useCallback(
    (rawX: number) => {
      'worklet';
      const width = trackWidth.value;
      if (width - THUMB_SIZE <= 0 || stepCount <= 1) return;
      const clampedX = Math.min(Math.max(0, rawX), width - THUMB_SIZE);
      const nearestIndex = Math.round((clampedX / (width - THUMB_SIZE)) * (stepCount - 1));
      // 드래그 중엔 손가락을 그대로 따라가야 해서 스프링 없이 즉시 스냅한다 —
      // 스프링은 아래 useEffect(외부에서 value가 바뀔 때, 즉 손을 안 대고 있을 때)에서만 쓴다.
      thumbX.value = indexToX(nearestIndex, width);
      runOnJS(notifyChange)(nearestIndex);
    },
    [trackWidth, thumbX, stepCount, indexToX, notifyChange]
  );

  const pan = Gesture.Pan()
    .onStart((event) => {
      updateFromX(event.x - THUMB_SIZE / 2);
    })
    .onUpdate((event) => {
      updateFromX(event.x - THUMB_SIZE / 2);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value + THUMB_SIZE / 2,
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.track} onLayout={handleLayout}>
        <Animated.View style={[styles.fill, fillStyle]} />
        {steps.map((_, index) => (
          <View
            key={index}
            pointerEvents="none"
            style={[
              styles.tick,
              {
                left: stepCount > 1 ? `${(index / (stepCount - 1)) * 100}%` : 0,
                marginLeft: stepCount > 1 ? -TICK_SIZE / 2 : (THUMB_SIZE - TICK_SIZE) / 2,
              },
            ]}
          />
        ))}
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary.electricCyan,
  },
  tick: {
    position: 'absolute',
    width: TICK_SIZE,
    height: TICK_SIZE,
    borderRadius: TICK_SIZE / 2,
    backgroundColor: '#ffffff',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: Colors.primary.electricCyan,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
