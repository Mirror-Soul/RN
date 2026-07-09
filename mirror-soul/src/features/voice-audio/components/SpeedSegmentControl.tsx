import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SpeedOption } from '../../../store/useVoiceAudioStore';
import { SPEED_OPTIONS, SEGMENT_CONFIG } from '../constants/voiceAudioConfig';

interface SpeedSegmentControlProps {
  selectedSpeed: SpeedOption;
  onSelect: (speed: SpeedOption) => void;
}

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
  mass: 0.7,
};

/**
 * 말하기 속도 세그먼트 컨트롤
 *
 * - 선택 배경이 버튼 간 withSpring으로 부드럽게 슬라이딩
 * - interpolateColor로 텍스트 색상이 선택/비선택 상태에 따라 전환
 * - UI Thread에서 동작하므로 60FPS 보장
 */
export const SpeedSegmentControl = ({ selectedSpeed, onSelect }: SpeedSegmentControlProps) => {
  const containerWidth = useSharedValue(0);
  const selectedIndex = useSharedValue(SPEED_OPTIONS.findIndex((o) => o.value === selectedSpeed));

  // 선택 인덱스가 바뀔 때마다 배경 위치 업데이트
  useEffect(() => {
    const newIndex = SPEED_OPTIONS.findIndex((o) => o.value === selectedSpeed);
    selectedIndex.value = withSpring(newIndex, SPRING_CONFIG);
  }, [selectedSpeed]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    containerWidth.value = e.nativeEvent.layout.width;
  };

  // 슬라이딩 배경 위치 계산
  const segmentCount = SPEED_OPTIONS.length;
  const buttonWidth = useDerivedValue(() => {
    const inner = containerWidth.value - SEGMENT_CONFIG.innerPadding * 2;
    return inner / segmentCount;
  });

  const animatedBgStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          SEGMENT_CONFIG.innerPadding + selectedIndex.value * buttonWidth.value,
      },
    ],
    width: buttonWidth.value,
  }));

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      {/* 슬라이딩 선택 배경 */}
      <Animated.View style={[styles.slidingBg, animatedBgStyle]} pointerEvents="none">
        <LinearGradient
          colors={['rgba(0, 255, 255, 0.2)', 'rgba(168, 85, 247, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.slidingGradient}
        />
      </Animated.View>

      {/* 버튼 목록 */}
      {SPEED_OPTIONS.map((option, index) => (
        <SegmentButton
          key={option.value}
          label={option.label}
          index={index}
          selectedIndex={selectedIndex}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  );
};

// ── 개별 버튼 컴포넌트 (색상 애니메이션 분리) ──────────────────────────
interface SegmentButtonProps {
  label: string;
  index: number;
  selectedIndex: Animated.SharedValue<number>;
  onPress: () => void;
}

const SegmentButton = ({ label, index, selectedIndex, onPress }: SegmentButtonProps) => {
  // 선택 여부에 따라 텍스트 색상을 UI Thread에서 직접 보간
  const progress = useDerivedValue(() => {
    const diff = Math.abs(selectedIndex.value - index);
    // diff가 0에 가까울수록 선택 상태 (progress = 1)
    return Math.max(0, 1 - diff);
  });

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.35)', 'rgba(0, 255, 255, 0.9)']
    ),
  }));

  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Animated.Text style={[styles.buttonText, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SEGMENT_CONFIG.containerHeight,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: SEGMENT_CONFIG.containerBorderRadius,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  slidingBg: {
    position: 'absolute',
    top: SEGMENT_CONFIG.innerPadding,
    bottom: SEGMENT_CONFIG.innerPadding,
    borderRadius: SEGMENT_CONFIG.buttonBorderRadius,
    borderWidth: 0.61,
    borderColor: 'rgba(0, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  slidingGradient: {
    flex: 1,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
