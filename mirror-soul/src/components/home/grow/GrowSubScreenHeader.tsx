import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useGrowthReturn } from './useGrowthReturn';

export default function GrowSubScreenHeader({ title, disabled = false, onBack }: {
  title: string; disabled?: boolean; onBack?: () => void;
}) {
  const { colors } = useThemeColors();
  const goBack = useGrowthReturn();
  return <View style={styles.header}>
    <Pressable onPress={onBack ?? goBack} disabled={disabled} accessibilityRole="button" accessibilityLabel="뒤로가기" accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.back, { backgroundColor: colors.background.glass, borderColor: colors.border.primary, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
      <Feather name="arrow-left" size={22} color={colors.text.primary} />
    </Pressable>
    <Text variant="heading" accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
    <View style={styles.spacer} accessible={false} />
  </View>;
}
const styles = StyleSheet.create({
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch', paddingVertical: 4 },
  back: { width: 48, height: 48, flexShrink: 0, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, fontSize: 20, lineHeight: 28, fontWeight: '600', textAlign: 'center' },
  spacer: { width: 48, flexShrink: 0 },
});
