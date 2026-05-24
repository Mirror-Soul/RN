import ContinueIcon from '@/assets/images/common/Continue_icon.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
}

/**
 * 공용 하단 플로팅/스탠다드 Primary Button 컴포넌트
 */
export default function PrimaryButton({ title, onPress, disabled, isLoading, style }: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        isDisabled ? styles.buttonDisabled : undefined,
        style
      ]}
    >
      {!isDisabled && (
        <LinearGradient
          colors={Colors.gradient.cyanToPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radii.lg }]}
        />
      )}
      {isLoading ? (
        <ActivityIndicator size="small" color={isDisabled ? Colors.neutral.disabledText : Colors.primary.soulBlack} />
      ) : (
        <>
          <Text style={[styles.title, isDisabled ? styles.titleDisabled : styles.titleActive]}>
            {title}
          </Text>
          {/* SVG Icon typically manages its own fill, but we can render it safely. */}
          {/* If it doesn't inherit props, we just render it. */}
          <ContinueIcon width={24} height={24} />
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  buttonDisabled: {
    backgroundColor: Colors.glass.white5,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
    zIndex: 1,
  },
  titleDisabled: {
    color: Colors.neutral.disabledText,
  },
  titleActive: {
    color: Colors.primary.soulBlack,
  }
});
