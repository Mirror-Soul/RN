import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolateColor,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import {Colors, FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';

interface DeleteConsentSectionProps {
  isAgreed: boolean;
  onToggleAgree: () => void;
  onSubmit: () => void;
}

export const DeleteConsentSection = ({ isAgreed, onToggleAgree, onSubmit }: DeleteConsentSectionProps) => {
  const { colors } = useThemeColors();
  
  // Reanimated Shared Values
  const progress = useSharedValue(isAgreed ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isAgreed ? 1 : 0, { duration: 250 });
  }, [isAgreed]);

  // Checkbox Animations
  const animatedCheckboxStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.background.glass, 'rgba(248, 113, 113, 0.2)']
      ),
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.border.primary, 'rgba(248, 113, 113, 0.5)']
      ),
    };
  });

  const animatedCheckIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(progress.value, { damping: 12, stiffness: 100 }) }],
      opacity: progress.value,
    };
  });

  // Button Animations
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['rgba(150, 150, 150, 0.04)', 'rgba(220, 38, 38, 0.25)']
      ),
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        ['rgba(150, 150, 150, 0.08)', 'rgba(220, 38, 38, 0.4)']
      ),
    };
  });

  const animatedButtonTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        progress.value,
        [0, 1],
        [colors.text.muted, 'rgba(248, 113, 113, 0.95)']
      ),
    };
  });

  return (
    <Animated.View 
      entering={FadeInDown.delay(200).duration(500).springify()}
      style={styles.container}
    >
      <Pressable 
        onPress={onToggleAgree} 
        style={styles.checkboxRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isAgreed }}
        accessibilityLabel="데이터 영구 삭제 동의"
      >
        <View style={styles.checkboxWrapper}>
          <Animated.View style={[styles.checkbox, animatedCheckboxStyle]}>
            <Animated.View style={animatedCheckIconStyle}>
              <Feather name="check" size={14} color="rgba(248, 113, 113, 0.9)" />
            </Animated.View>
          </Animated.View>
        </View>
        <Text style={[styles.consentText, { color: colors.text.secondary }]}>
          위 내용을 모두 확인하였으며, 30일 후 모든 데이터 영구 삭제에 동의합니다.
        </Text>
      </Pressable>

      <View style={styles.buttonSpacer} />

      <Pressable 
        onPress={onSubmit} 
        disabled={!isAgreed}
        accessibilityRole="button"
        accessibilityLabel="탈퇴하기"
      >
        <Animated.View style={[styles.submitButton, animatedButtonStyle]}>
          <Animated.Text style={[styles.submitButtonText, animatedButtonTextStyle]}>
            탈퇴하기
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xxl,
    flex: 1,
    justifyContent: 'flex-start',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkboxWrapper: {
    paddingTop: Spacing.xxs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 0.61,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consentText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 23,
    letterSpacing: -0.15,
  },
  buttonSpacer: {
    flex: 1,
  },
  submitButton: {
    height: 53.22,
    borderWidth: 0.61,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.giant,
  },
  submitButtonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    letterSpacing: -0.15,
  },
});
