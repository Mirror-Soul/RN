import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import {Radii, Spacing} from '@/src/constants/theme';


interface AnimatedSwitchProps {
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

// CSS 명세에서 추출한 정확한 수치
const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 24;
const THUMB_SIZE = 20;
const THUMB_OFFSET = 2.61; // OFF 상태 thumb의 left 위치
const THUMB_ON_X = 25.38;  // ON 상태 thumb의 left 위치

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 0.8,
  overshootClamping: false,
};

/**
 * CSS 명세 기반 커스텀 Reanimated 토글 스위치
 *
 * 전략 (60FPS 보장):
 * - Thumb 이동: withSpring으로 translateX UI Thread 직접 조작
 * - 배경 크로스페이드: ON 배경(그라디언트)과 OFF 배경을 겹쳐두고
 *   opacity를 보간하는 방식으로 색상 전환 → interpolateColor보다 성능 우수
 */
export const AnimatedSwitch = ({ value, onToggle, disabled = false, accessibilityLabel }: AnimatedSwitchProps) => {
  const { colors } = useThemeColors();
  
  // 0 = OFF, 1 = ON
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, SPRING_CONFIG);
  }, [value]);

  // Thumb 위치 애니메이션
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          THUMB_OFFSET + progress.value * (THUMB_ON_X - THUMB_OFFSET),
      },
    ],
  }));

  // ON 배경 (그라디언트) opacity
  const onBgStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  // OFF 배경 (회색) opacity
  const offBgStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  return (
    <Pressable
      onPress={disabled ? undefined : onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={styles.hitArea}
    >
      <Animated.View style={[styles.track, { borderColor: colors.border.primary }]}>
        {/* OFF 배경 레이어 */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.offBackground, offBgStyle, { backgroundColor: colors.background.glass }]} />

        {/* ON 배경 레이어 (그라디언트, 위에 겹침) */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.gradientWrapper, onBgStyle]}>
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.6)', 'rgba(168, 85, 247, 0.6)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Thumb */}
        <Animated.View style={[styles.thumb, thumbStyle, { backgroundColor: colors.text.primary, shadowColor: colors.text.primary }]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // 탭 영역을 넉넉하게 확보
  hitArea: {
    padding: Spacing.xs,
    margin: -4,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: Radii.full,
    borderWidth: 0.61,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  offBackground: {
    borderRadius: Radii.full,
  },
  gradientWrapper: {
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radii.full,
    top: THUMB_OFFSET,
    left: Spacing.none,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
