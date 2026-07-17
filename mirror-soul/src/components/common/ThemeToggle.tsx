/**
 * ThemeToggle — 독립 테마 토글 컴포넌트
 *
 * 사용법:
 *   <ThemeToggle />                    // 토글만
 *   <ThemeToggle showLabel={true} />   // "다크 모드" 레이블 포함
 *   <ThemeToggle size="sm" />          // 작은 사이즈
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Colors, FontFamily } from '@/src/constants/theme';

const SIZES = {
  md: { trackW: 44, trackH: 24, thumbSize: 20, radius: 12 },
  sm: { trackW: 36, trackH: 20, thumbSize: 16, radius: 10 },
} as const;

interface ThemeToggleProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const ThemeToggle = ({
  size = 'md',
  showLabel = false,
}: ThemeToggleProps) => {
  const { themeMode, setThemeMode } = useThemeStore();
  const { colors } = useThemeColors();
  const isDark = themeMode === 'dark';
  const dim = SIZES[size];

  // Thumb 이동: 끝 여백 2px + thumb 크기 반영
  const thumbTravel = dim.trackW - dim.thumbSize - 4;

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(isDark ? thumbTravel : 0, {
          stiffness: 350,
          damping: 28,
          mass: 0.8,
        }),
      },
    ],
  }));

  const handleToggle = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text.primary }]}>
          {isDark ? '다크 모드' : '라이트 모드'}
        </Text>
      )}

      <Pressable
        onPress={handleToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: isDark }}
        accessibilityLabel={isDark ? '다크 모드 켜짐' : '라이트 모드'}
      >
        {/* 트랙 */}
        <View
          style={[
            styles.track,
            {
              width: dim.trackW,
              height: dim.trackH,
              borderRadius: dim.radius,
              backgroundColor: isDark
                ? Colors.primary.electricCyan + '66' // 40% opacity
                : 'rgba(100, 100, 100, 0.25)',
            },
          ]}
        >
          {/* Thumb */}
          <Animated.View
            style={[
              styles.thumb,
              {
                width: dim.thumbSize,
                height: dim.thumbSize,
                borderRadius: dim.thumbSize / 2,
                backgroundColor: isDark
                  ? Colors.primary.electricCyan
                  : '#FFFFFF',
              },
              thumbStyle,
            ]}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 22,
  },
  track: {
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
