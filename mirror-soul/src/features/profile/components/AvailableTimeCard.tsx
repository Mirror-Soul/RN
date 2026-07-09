import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePulseAnimation, usePressAnimation } from '../hooks/useProfileAnimations';

interface AvailableTimeCardProps {
  timeString: string;
  delay?: number;
  onPressRefill?: () => void;
}

export const AvailableTimeCard = ({ timeString, delay = 100, onPressRefill }: AvailableTimeCardProps) => {
  const { startPulse, animatedStyle: pulseStyle } = usePulseAnimation();
  const { handlePressIn, handlePressOut, animatedStyle: pressStyle } = usePressAnimation();

  useEffect(() => {
    startPulse();
  }, [startPulse]);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600).springify()}
      style={styles.containerMargin}
    >
      <View style={styles.cardContainer}>
        {/* Glow Background animated */}
        <Animated.View style={[StyleSheet.absoluteFill, pulseStyle]}>
          <LinearGradient
            colors={['rgba(0, 211, 243, 0.06)', 'rgba(0, 0, 0, 0)', 'rgba(194, 122, 255, 0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          />
        </Animated.View>

        <Text style={styles.titleText}>대화 가능한 시간</Text>

        <View style={styles.timeContainer}>
          <MaskedView
            style={styles.maskContainer}
            maskElement={
              <Text style={styles.timeTextMask}>{timeString}</Text>
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

        <Animated.View
          style={[styles.buttonContainer, pressStyle]}
          onTouchStart={handlePressIn}
          onTouchEnd={(e) => {
            handlePressOut();
            if (onPressRefill) onPressRefill();
          }}
          onTouchCancel={handlePressOut}
        >
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
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  containerMargin: {
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 32,
  },
  cardContainer: {
    width: '100%',
    height: 198,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    flex: 1,
  },
  titleText: {
    position: 'absolute',
    top: 24,
    left: 24,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#99A1AF',
  },
  timeContainer: {
    position: 'absolute',
    top: 56,
    left: 24,
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
    fontWeight: '400',
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: 4.8,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    top: 128,
    left: 24,
    width: 295, // matching css ~295.73
    height: 45,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.61,
    borderColor: 'rgba(0, 255, 255, 0.22)',
    borderRadius: 16,
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#53EAFD',
    textAlign: 'center',
  },
});
