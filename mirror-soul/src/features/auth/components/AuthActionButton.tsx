import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/** A quiet solid action; the logo carries the brand gradient. */
export function AuthActionButton({ title, onPress, primary = false, disabled = false, busy = false }: {
  title: string; onPress: () => void; primary?: boolean; disabled?: boolean; busy?: boolean;
}) {
  const { colors } = useThemeColors();
  const blocked = disabled || busy;
  const foreground = primary && !blocked ? colors.background.primary : colors.text.primary;
  return <Pressable accessibilityRole="button" accessibilityLabel={title}
    accessibilityState={{ disabled: blocked, busy }} disabled={blocked} onPress={onPress}
    style={({ pressed }) => [styles.button, { backgroundColor: primary && !blocked ? colors.text.primary : colors.background.card,
      borderColor: primary && !blocked ? 'transparent' : colors.border.primary }, (pressed || blocked) && { opacity: 0.65 }]}>
    {busy && <ActivityIndicator color={foreground} />}
    <Text lineBreakStrategyIOS="hangul-word" textBreakStrategy="highQuality" style={[styles.text, { color: foreground }]}>{title}</Text>
    {primary && !busy && <Feather accessible={false} name="arrow-right" size={18} color={foreground} />}
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 54, borderWidth: 1, borderRadius: Radii.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  text: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, textAlign: 'center' },
});
