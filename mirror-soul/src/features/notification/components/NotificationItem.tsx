import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { NotificationToggle } from './NotificationToggle';

interface NotificationItemProps {
  title: string;
  description: string;
  value: boolean | null;
  onToggle: () => void;
  isLast?: boolean;
  disabled?: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
}

export function NotificationItem({ title, description, value, onToggle, isLast = false, disabled = false, isSaving = false, isLoading = false }: NotificationItemProps) {
  const { colors } = useThemeColors();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.3;
  return (
    <View style={[styles.container, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border.primary }]}>
      <View style={[styles.row, stacked && styles.stacked]}>
        <View style={[styles.copy, stacked && styles.stackedCopy]}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>
        </View>
        <NotificationToggle value={value} onToggle={onToggle} label={title} disabled={disabled} isSaving={isSaving} isLoading={isLoading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stacked: { flexDirection: 'column', alignItems: 'stretch', gap: Spacing.xs },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xs },
  stackedCopy: { flex: 0 },
  title: { fontFamily: FontFamily.sans, fontWeight: FontWeight.semibold, fontSize: FontSize.base, lineHeight: 23 },
  description: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
});
