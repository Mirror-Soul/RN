import { Colors } from '@/src/constants/theme';
import React, { useCallback, useEffect, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface RegionRadiusSliderProps {
  /** 왼쪽(가까운 동네)부터 오른쪽(먼 동네) 순으로 나열한 고정 단계 값. 예: [1, 10, 30, 50] */
  steps: number[];
  value: number;
  onValueChange: (value: number) => void;
}

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 4;
const TICK_WIDTH = 2;
const TICK_HEIGHT = 10;

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

  // 슬라이더 밖(초기 로드, 검색으로 앵커 변경, 탭으로 단계 선택 등)에서 value가 바뀌면
  // 썸 위치도 따라간다 — 스프링이 아니라 timing을 쓴다: 스프링은 도착 지점을 지나쳤다가
  // 되돌아오는 오버슈트가 보여서 "튕기는" 느낌을 준다는 피드백이 있었다. 드래그 중
  // updateFromX가 이미 스프링 없이 즉시 스냅하는 것과도 느낌을 맞춘다.
  useEffect(() => {
    if (trackWidth.value > 0) {
      thumbX.value = withTiming(indexToX(currentIndex, trackWidth.value), { duration: 200 });
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

  // minDistance(0): 기본값(약 10pt)이면 손가락을 움직이지 않는 순수 탭은 팬 제스처가
  // 아예 활성화되지 않아 onStart가 안 불린다 — 트랙의 특정 지점(예: "30개" 위치)을
  // 드래그 없이 탭만 해도 바로 스냅되게 하려면 0으로 낮춰 터치 즉시 활성화시켜야 한다.
  const pan = Gesture.Pan()
    .minDistance(0)
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
                marginLeft: stepCount > 1 ? -TICK_WIDTH / 2 : (THUMB_SIZE - TICK_WIDTH) / 2,
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
  // 이 트랙은 discovery-region-settings.tsx의 흰 bottomPanel 위에서만 쓰인다 — 반투명
  // 흰색(원래 값)은 흰 배경 위에서 사실상 안 보여서, 회색으로 바꿔 4단계 트랙 자체가
  // 눈에 들어오게 한다.
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: Colors.primary.mapMarkerBlue,
  },
  // 회색 세로선 — 트랙과 마찬가지로 흰 배경에서 안 보이던 흰 점 대신, 4개 정지 지점을
  // 명확히 표시하는 회색 선으로 교체.
  tick: {
    position: 'absolute',
    top: -(TICK_HEIGHT - TRACK_HEIGHT) / 2,
    width: TICK_WIDTH,
    height: TICK_HEIGHT,
    borderRadius: TICK_WIDTH / 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: Colors.primary.mapMarkerBlue,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
