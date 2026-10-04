import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  FontFamily,
  FontSize,
  FontWeight,
  Layout,
  Spacing,
} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/** Distance from the screen edge; SafeAreaView callers subtract their top inset. */
export function mainTabTopPadding(topInset: number) {
  return Math.max(topInset + Spacing.md, Layout.SCREEN_PADDING);
}

export function MainTabHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.row}>
      <Text
        accessibilityRole="header"
        lineBreakStrategyIOS="hangul-word"
        textBreakStrategy="highQuality"
        style={[styles.title, { color: colors.text.primary }]}
      >
        {title}
      </Text>
      {action}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    lineHeight: 31,
    letterSpacing: -0.7,
  },
});
