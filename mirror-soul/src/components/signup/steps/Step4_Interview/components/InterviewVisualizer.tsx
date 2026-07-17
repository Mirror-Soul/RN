import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay,
  Easing
} from 'react-native-reanimated';
import {Colors, Spacing} from '@/src/constants/theme';

interface InterviewVisualizerProps {
  isRecording?: boolean;
}

/**
 * VisualizerBar
 * 개별 막대의 애니메이션을 담당하는 내부 컴포넌트입니다.
 */
function VisualizerBar({ index, isRecording }: { index: number, isRecording: boolean }) {
  const baseHeight = 12;
  const height = useSharedValue(baseHeight);
  const opacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (isRecording) {
      // 녹음 중: 활발한 파동 애니메이션
      const recordingSequence = [
        baseHeight + 10 + (index % 3) * 10,
        baseHeight + 40 + (index % 2) * 15,
        baseHeight + 20 + (index % 4) * 8,
        baseHeight + 50 + (index % 3) * 12,
        baseHeight + 15
      ];

      height.value = withRepeat(
        withSequence(
          ...recordingSequence.map(h => withTiming(h, { duration: 300 + (index * 20), easing: Easing.inOut(Easing.ease) }))
        ),
        -1,
        true
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 500 }),
          withTiming(0.8, { duration: 500 }),
          withTiming(1, { duration: 500 }),
          withTiming(0.4, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      // 대기 중: 부드러운 숨쉬기 애니메이션
      height.value = withDelay(
        index * 150,
        withRepeat(
          withSequence(
            withTiming(baseHeight + 12, { duration: 1250, easing: Easing.inOut(Easing.ease) }),
            withTiming(baseHeight, { duration: 1250, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: 1250 }),
          withTiming(0.1, { duration: 1250 })
        ),
        -1,
        true
      );
    }
  }, [isRecording, index]);

  return (
    <Animated.View 
      style={[
        styles.bar, 
        animatedStyle,
        { 
          backgroundColor: isRecording 
            ? Colors.primary.electricCyan 
            : Colors.primary.vividPurple 
        }
      ]} 
    />
  );
}

/**
 * InterviewVisualizer
 * 
 * 프리미엄 루핑 애니메이션 비주얼라이저입니다. (React 19 호환)
 */
export default function InterviewVisualizer({ isRecording = false }: InterviewVisualizerProps) {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <View style={styles.container}>
      <View style={styles.waveWrapper}>
        {bars.map((i) => (
          <VisualizerBar key={i} index={i} isRecording={isRecording} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  waveWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  bar: {
    width: 5,
    borderRadius: 2.5,
  },
});
