import React, { useEffect } from 'react';
import {FontFamily, Colors, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePulseAnimation, usePressAnimation } from '../hooks/useProfileAnimations';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTimeStatusQuery } from '../hooks/useTimeStatusQuery';
import { formatCallTime } from '@/src/utils/formatCallTime';

interface AvailableTimeCardProps {
  /** 지정하지 않으면 서버에서 조회한 남은 시간을 사용합니다. */
  timeString?: string;
  delay?: number;
  onPressRefill?: () => void;
}

export const AvailableTimeCard = ({ timeString, delay = 100, onPressRefill }: AvailableTimeCardProps) => {
  const { data } = useTimeStatusQuery();
  const displayValue = timeString ?? formatCallTime(data?.remainingTalkTime ?? 0);
  const { startPulse, animatedStyle: pulseStyle } = usePulseAnimation();
  const { handlePressIn, handlePressOut, animatedStyle: pressStyle } = usePressAnimation();
  const { colors } = useThemeColors();

  useEffect(() => {
    startPulse();
  }, [startPulse]);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={styles.containerMargin}
    >
      <View style={[styles.cardContainer, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        {/* Glow Background animated */}
        <Animated.View style={[StyleSheet.absoluteFill, pulseStyle]}>
          <LinearGradient
            colors={['rgba(0, 211, 243, 0.06)', 'rgba(0, 0, 0, 0)', 'rgba(194, 122, 255, 0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          />
        </Animated.View>

        <Text style={[styles.titleText, { color: colors.text.muted }]}>대화 가능한 시간</Text>

        <View style={styles.timeContainer}>
          <MaskedView
            style={styles.maskContainer}
            maskElement={
              <Text style={styles.timeTextMask}>{displayValue}</Text>
            }
          >
            <LinearGradient
              colors={['#00FFFF', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </MaskedView>
        </View>

        <Pressable
          onPress={onPressRefill}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel="시간 채우기"
        >
          <Animated.View style={[styles.buttonContainer, pressStyle]}>
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.22)', 'rgba(168, 85, 247, 0.22)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Feather name="plus" size={16} color="#53EAFD" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>시간 채우기</Text>
          </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  containerMargin: {
    width: '100%',
    marginBottom: Spacing.xxxl,
  },
  cardContainer: {
    width: '100%',
    height: 198,
    borderWidth: 0.61,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    flex: 1,
  },
  titleText: {
    position: 'absolute',
    top: Spacing.xxl,
    left: Spacing.xxl,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  timeContainer: {
    position: 'absolute',
    top: 56,
    left: Spacing.xxl,
    width: 295,
    height: 48,
    // Note: Drop shadow on mask might need wrapper or separate layer in RN
  },
  maskContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  timeTextMask: {
    fontFamily: 'Menlo', // Menlo/Monospace font for time
    fontWeight: FontWeight.regular,
    fontSize: FontSize.giant,
    lineHeight: 48,
    letterSpacing: 4.8,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    top: 128,
    left: Spacing.xxl,
    width: 295, // matching css ~295.73
    height: 45,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.61,
    borderColor: 'rgba(0, 255, 255, 0.22)',
    borderRadius: Radii.lg,
    gap: Spacing.sm,
  },
  buttonIcon: {
    marginRight: Spacing.xs,
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#53EAFD',
    textAlign: 'center',
  },
});
