import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function SignupSection({ title, description, children, icon, compact = false }: { title: string; description?: string; children: React.ReactNode; icon?: React.ComponentProps<typeof Feather>['name']; compact?: boolean }) {
  const { colors } = useThemeColors();
  return <View style={[styles.card, compact && styles.compactCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
    <View style={styles.heading}>
      <View style={styles.titleRow}>
        {icon && <Feather name={icon} size={19} color={colors.brand.accent} />}
        <Text accessibilityRole="header" style={[styles.title, { color: icon ? colors.brand.accent : colors.text.primary }]}>{title}</Text>
      </View>
      {description && <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>}
    </View>
    {children}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: Spacing.lg, borderWidth: 1, borderRadius: Radii.lg2, gap: Spacing.xl },
  compactCard: { gap: Spacing.sm },
  heading: { gap: Spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: 26, flexShrink: 1 },
  description: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
});
