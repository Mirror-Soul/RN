import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import FormLabel from './FormLabel';

interface Props {
  label: string;
  placeholder: string;
  hasValue?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  isOpen?: boolean;
  disabled?: boolean;
}
export default function StepSelectDropdown({ label, placeholder, hasValue = false, onPress, style, isOpen = false, disabled = false }: Props) {
  const { colors } = useThemeColors();
  return <View style={[styles.container, style]}>
    {label ? <FormLabel label={label} /> : null}
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen, disabled }} accessibilityLabel={label || placeholder} disabled={disabled} onPress={() => { Keyboard.dismiss(); onPress(); }}
      style={[styles.row, { backgroundColor: colors.background.glass, borderColor: isOpen ? colors.brand.accent : colors.border.primary, opacity: disabled ? 0.5 : 1 }]}>
      <Text style={[styles.value, { color: hasValue ? colors.text.primary : colors.text.secondary }]}>{placeholder}</Text>
      <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.secondary} />
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  container: { width: '100%', gap: Spacing.sm },
  row: { minHeight: 52, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  value: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
});
