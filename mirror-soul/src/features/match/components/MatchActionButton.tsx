import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import {
  FontFamily,
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
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  primary?: boolean;
  danger?: boolean;
  icon?: (color: string) => React.ReactNode;
}) {
  const { colors, palette } = useMatchingDesign();
  const color = primary
    ? palette.onAccent
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
          backgroundColor: primary ? palette.buttonBase : danger ? colors.background.card : palette.secondaryButton,
          borderColor: primary ? palette.buttonBorder : danger ? palette.softBorder : palette.buttonBorder,
          opacity: disabled || busy ? 0.6 : pressed ? 0.8 : 1,
        },
      ]}
    >
      {busy && <ActivityIndicator color={color} />}
      {!busy && icon?.(color)}
      <Text style={[styles.label, { color }]}>{busy ? '처리 중…' : label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  label: {
    flexShrink: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: 23,
    textAlign: 'center',
  },
});
