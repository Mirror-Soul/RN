import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function SignupSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  const { colors } = useThemeColors();
  return <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      {description && <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>}
    </View>
    {children}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: Spacing.lg, borderWidth: 1, borderRadius: Radii.lg2, gap: Spacing.xl },
  heading: { gap: Spacing.xs },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: 26 },
  description: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
});
