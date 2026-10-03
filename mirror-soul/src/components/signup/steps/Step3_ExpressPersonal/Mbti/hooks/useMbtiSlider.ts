import { useRef, useEffect, useCallback } from 'react';
import { PanResponder, Animated, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface UseMbtiSliderProps {
  value: number;
  onChange: (value: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const useMbtiSlider = ({
  value,
  onChange,
  onDragStart,
  onDragEnd,
}: UseMbtiSliderProps) => {
  const sliderWidthRef = useRef(0);
  const containerXRef = useRef(0);
  const valueRef = useRef(value);
  const lastHapticValueRef = useRef(value);
  const containerRef = useRef<View | null>(null);
  const mounted = useRef(true);

  // ── 콜백을 ref로 래핑: PanResponder 클로저에서 항상 최신 함수를 참조 ──
  const onChangeRef = useRef(onChange);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  onChangeRef.current = onChange;
  onDragStartRef.current = onDragStart;
  onDragEndRef.current = onDragEnd;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; onDragEndRef.current?.(); };
  }, []);

  // Handle position animation (0 to 100)
  const animValue = useRef(new Animated.Value(value)).current;

  // 외부 value 변경 시 내부 상태 및 애니메이션 동기화
  useEffect(() => {
    valueRef.current = value;
    animValue.setValue(value);
    lastHapticValueRef.current = value; // 햅틱 기준값도 동기화하여 오작동 방지
  }, [value, animValue]);

  const triggerHaptics = (newVal: number) => {
    const prev = lastHapticValueRef.current;
    const passingCenter =
      (prev < 50 && newVal >= 50) || (prev > 50 && newVal <= 50);
    const atEnd = (newVal === 0 || newVal === 100) && prev !== newVal;

    if (passingCenter || atEnd) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    lastHapticValueRef.current = newVal;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy),
      onStartShouldSetPanResponder: () => false,
      onPanResponderGrant: () => {
        onDragStartRef.current?.();
      },
      onPanResponderMove: (_, gs) => {
        const width = sliderWidthRef.current;
        if (width <= 0) return;

        const relativeX = gs.moveX - containerXRef.current;
        const clamped = Math.max(0, Math.min(relativeX, width));
        const newValue = Math.round((clamped / width) * 100);

        if (newValue !== valueRef.current) {
          valueRef.current = newValue;
          animValue.setValue(newValue);
          onChangeRef.current(newValue);
          triggerHaptics(newValue);
        }
      },
      onPanResponderRelease: () => {
        onDragEndRef.current?.();
      },
      onPanResponderTerminate: () => {
        onDragEndRef.current?.();
      },
    })
  ).current;

  const setSliderWidth = (width: number) => {
    sliderWidthRef.current = width;
    containerRef.current?.measureInWindow(x => { if (mounted.current) containerXRef.current = x; });
  };

  const measureContainer = useCallback((ref: View | null) => { containerRef.current = ref; }, []);

  return {
    panResponder,
    animValue,
    setSliderWidth,
    measureContainer,
  };
};
