import { useRef, useEffect } from 'react';
import { PanResponder, Animated } from 'react-native';
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

  // Sync valueRef with external value
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Handle position animation (0 to 100)
  const animValue = useRef(new Animated.Value(value)).current;
  
  // Update animation value when external value changes
  useEffect(() => {
    animValue.setValue(value);
  }, [value]);

  const triggerHaptics = (newVal: number) => {
    const prev = lastHapticValueRef.current;
    const passingCenter =
      (prev < 50 && newVal >= 50) || (prev > 50 && newVal <= 50);
    const atEnd = (newVal === 0 || newVal === 100) && prev !== newVal;

    if (passingCenter || atEnd) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    lastHapticValueRef.current = newVal;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy),
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onDragStart?.();
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
          onChange(newValue);
          triggerHaptics(newValue);
        }
      },
      onPanResponderRelease: () => {
        onDragEnd?.();
      },
      onPanResponderTerminate: () => {
        onDragEnd?.();
      },
    })
  ).current;

  const setSliderWidth = (width: number) => {
    sliderWidthRef.current = width;
  };

  const measureContainer = (ref: any) => {
    if (ref) {
      setTimeout(() => {
        ref.measureInWindow((x: number) => {
          containerXRef.current = x;
        });
      }, 100);
    }
  };

  return {
    panResponder,
    animValue,
    setSliderWidth,
    measureContainer,
  };
};
