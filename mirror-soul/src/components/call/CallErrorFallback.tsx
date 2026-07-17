import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {Colors, Radii, Layout, FontSize, FontWeight, Spacing} from '@/src/constants/theme';

interface CallErrorFallbackProps {
  message: string;
  onBack: () => void;
}

export default function CallErrorFallback({ message, onBack }: CallErrorFallbackProps) {
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
    <Animated.View style={[styles.errorContainer, { opacity: opacityAnim, transform: [{ translateY: translateYAnim }] }]}>
      <MaterialIcons name="error-outline" size={56} color={Colors.neutral.lightGray} style={styles.errorIcon} />
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>앗, 연결에 문제가 생겼어요 !</Text>
        <Text style={styles.errorMessage}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="이전 화면으로 돌아가기">
        <Text style={styles.backButtonText}>돌아가기</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.SCREEN_PADDING || 24,
  },
  errorIcon: {
    marginBottom: Spacing.xxl,
  },
  errorCard: {
    width: '100%',
    backgroundColor: Colors.glass.white05,
    borderWidth: 1,
    borderColor: Colors.glass.white15,
    borderRadius: Radii.lg2,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.giant,
  },
  errorTitle: {
    color: Colors.neutral.pureWhite,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  errorMessage: {
    color: Colors.neutral.lightGray,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.glass.white10,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.neutral.pureWhite,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
});
