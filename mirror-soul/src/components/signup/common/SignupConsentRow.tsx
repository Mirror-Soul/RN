import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Props {
  checked: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
  onViewDetail: () => void;
  viewDetailLabel: string;
  children: React.ReactNode;
  detail: React.ReactNode;
}

/** One generous checkbox target and a separate detail button, with no overlapping hitSlop. */
export default function SignupConsentRow({ checked, onToggle, accessibilityLabel, onViewDetail, viewDetailLabel, children, detail }: Props) {
  const { colors, isDark } = useThemeColors();
  return <View style={styles.row}>
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8} accessibilityRole="checkbox" accessibilityLabel={accessibilityLabel} accessibilityState={{ checked }} style={styles.toggle}>
      <View style={[styles.checkbox, { borderColor: checked ? colors.brand.accent : colors.border.primary, backgroundColor: checked ? colors.brand.accent : colors.background.glass }]}>
        {checked && <Feather name="check" size={14} color={isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite} />}
      </View>
      <View style={styles.label}>{children}</View>
    </TouchableOpacity>
    <TouchableOpacity onPress={onViewDetail} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={viewDetailLabel} style={styles.detail}>
      {detail}
    </TouchableOpacity>
  </View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, alignSelf: 'stretch', minWidth: 0 },
  toggle: { flex: 1, minWidth: 0, minHeight: 44, paddingVertical: Spacing.xs, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  checkbox: { width: 20, height: 20, flexShrink: 0, borderWidth: 1, borderRadius: Radii.xs, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, minWidth: 0 },
  detail: { minWidth: 44, minHeight: 44, paddingHorizontal: Spacing.xs, flexShrink: 0, justifyContent: 'center', alignItems: 'center' },
});
