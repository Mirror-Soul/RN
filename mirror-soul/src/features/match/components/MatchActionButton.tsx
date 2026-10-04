import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import {
  FontFamily,
  Colors,
  FontSize,
  FontWeight,
  Radii,
  Spacing,
} from '@/src/constants/theme';
import {
  useMatchingDesign,
  MatchingText as Text,
} from '@/src/features/match/components/MatchingDesign';

export function MatchActionButton({
  label,
  onPress,
  disabled = false,
  busy = false,
  primary = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  const { colors, palette } = useMatchingDesign();
  const color = primary
    ? palette.onGradient
    : danger
      ? colors.state.danger
      : colors.text.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.background.card,
          borderColor: primary ? 'transparent' : colors.border.primary,
          opacity: disabled || busy ? 0.6 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {primary && (
        <LinearGradient
          pointerEvents="none"
          colors={Colors.gradient.cyanToPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: Radii.full }]}
        />
      )}
      {busy && <ActivityIndicator color={color} />}
      <Text style={[styles.label, { color }]}>{busy ? '처리 중…' : label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.full,
    padding: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: 23,
    textAlign: 'center',
  },
});
