import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {Radii, Layout, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import CallScreenBackground from './CallScreenBackground';

interface CallErrorFallbackProps {
  message: string;
  onBack: () => void;
}

export default function CallErrorFallback({ message, onBack }: CallErrorFallbackProps) {
  const { colors, isDark } = useThemeColors();
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, translateYAnim]);

  return (
    <CallScreenBackground variant="error">
      <Animated.View style={[styles.errorContainer, { opacity: opacityAnim, transform: [{ translateY: translateYAnim }] }]}>
        <MaterialIcons name="error-outline" size={56} color={colors.text.muted} style={styles.errorIcon} />
        <BlurView
          intensity={isDark ? 40 : 60}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.errorCard, { borderColor: colors.border.primary }]}
        >
          <Text style={[styles.errorTitle, { color: colors.text.primary }]}>앗, 연결에 문제가 생겼어요 !</Text>
          <Text style={[styles.errorMessage, { color: colors.text.secondary }]}>{message}</Text>
        </BlurView>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.background.glass }]}
          onPress={onBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="이전 화면으로 돌아가기"
        >
          <Text style={[styles.backButtonText, { color: colors.text.primary }]}>돌아가기</Text>
        </TouchableOpacity>
      </Animated.View>
    </CallScreenBackground>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.SCREEN_PADDING || 24,
  },
  errorIcon: {
    marginBottom: Spacing.xxl,
  },
  errorCard: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radii.lg2,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.giant,
  },
  errorTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  errorMessage: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    width: '100%',
    height: 56,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
});
