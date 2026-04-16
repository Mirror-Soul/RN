import ContinueIcon from '@/assets/images/common/Continue_icon.svg';
import { Colors } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * 공용 하단 플로팅/스탠다드 Primary Button 컴포넌트
 */
export default function PrimaryButton({ title, onPress, disabled, style }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : undefined,
        style
      ]}
    >
      {!disabled && (
        <LinearGradient
          colors={Colors.gradient.cyanToPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />
      )}
      <Text style={[styles.title, disabled ? styles.titleDisabled : styles.titleActive]}>
        {title}
      </Text>
      {/* SVG Icon typically manages its own fill, but we can render it safely. */}
      {/* If it doesn't inherit props, we just render it. */}
      <ContinueIcon width={24} height={24} />
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
    borderRadius: 16,
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
