import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import MirrorSoulMark from '@/src/components/brand/MirrorSoulMark';

export default function LoginHeader({ compact = false, small = false }: { compact?: boolean; small?: boolean }) {
  const { colors } = useThemeColors();
  return <View style={[styles.container, compact && styles.compact]}>
    <View style={[styles.brand, compact && styles.compactBrand]}>
      <MirrorSoulMark size={compact ? 32 : small ? 64 : 76} />
      <Text accessibilityRole="header" style={[styles.wordmark, small && styles.smallWordmark, compact && styles.compactWordmark, { color: colors.text.primary }]}>MirrorSoul</Text>
    </View>
    {!compact && <Text lineBreakStrategyIOS="hangul-word" textBreakStrategy="highQuality" style={[styles.description, { color: colors.text.secondary }]}>
      나를 닮은 트윈, 새로운 연결.
    </Text>}
  </View>;
}
const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.sm },
  compact: { alignItems: 'flex-start' },
  brand: { alignItems: 'center', gap: Spacing.sm },
  compactBrand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  wordmark: { fontFamily: FontFamily.sans, fontSize: 30, fontWeight: FontWeight.bold, lineHeight: 38, letterSpacing: -1.1, textAlign: 'center', flexShrink: 1 },
  smallWordmark: { fontSize: 28, lineHeight: 36 },
  compactWordmark: { fontSize: FontSize.xxl, lineHeight: 28, letterSpacing: -0.6, textAlign: 'left' },
  description: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 23, textAlign: 'center' },
});
