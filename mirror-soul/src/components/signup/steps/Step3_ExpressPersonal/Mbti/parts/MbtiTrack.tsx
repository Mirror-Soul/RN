import {Colors, Radii, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

import type { GestureResponderHandlers, ViewStyle } from 'react-native';

interface Props {
  panHandlers: GestureResponderHandlers;
  onLayout: (width: number) => void;
  measureContainer: (ref: View | null) => void;
  animValue: Animated.Value;
}

export default function MbtiTrack({
  panHandlers,
  onLayout,
  measureContainer,
  animValue,
}: Props) {
  const { colors } = useThemeColors();

  return (
    <View
      style={styles.trackWrapper}
      {...panHandlers}
      onLayout={(e) => onLayout(e.nativeEvent.layout.width)}
      ref={measureContainer}
    >
      <View style={[styles.track, { backgroundColor: colors.border.primary }]}>
        <LinearGradient
          colors={[Colors.primary.vividPurple, 'rgba(0, 0, 0, 0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.5, y: 0.5 }}
          style={styles.gradientLeft}
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', Colors.primary.electricCyan]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradientRight}
        />
        <View style={[styles.centerLine, { backgroundColor: colors.border.strong }]} />

        <Animated.View
          style={[
            styles.handleWrapper,
            {
              left: animValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <View style={styles.handle}>
            <View style={styles.handleInner} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const glowStyle = Platform.select({
  ios: {
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  android: { elevation: 5 },
}) as ViewStyle;

const styles = StyleSheet.create({
  trackWrapper: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: Radii.xs,
    position: 'relative',
    alignItems: 'center',
  },
  gradientLeft: {
    position: 'absolute',
    left: Spacing.none,
    width: '50%',
    height: '100%',
    borderRadius: Radii.xs,
  },
  gradientRight: {
    position: 'absolute',
    right: Spacing.none,
    width: '50%',
    height: '100%',
    borderRadius: Radii.xs,
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    width: 1,
    height: '100%',
  },
  handleWrapper: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    marginLeft: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 24,
    height: 24,
    borderRadius: Radii.md,
    backgroundColor: Colors.neutral.pureWhite,
    borderWidth: 1.836,
    borderColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
    ...glowStyle,
  },
  handleInner: {
    width: 8,
    height: 8,
    borderRadius: Radii.xs,
    backgroundColor: Colors.primary.electricCyan,
  },
});
