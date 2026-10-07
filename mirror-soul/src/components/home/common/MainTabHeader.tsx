import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BrowseText as Text } from './BrowseText';
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
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text
          variant="heading"
          accessibilityRole="header"
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="highQuality"
          style={[styles.title, { color: colors.text.primary }]}
        >
          {title}
        </Text>
        {action}
      </View>
      {description ? (
        <Text
          lineBreakStrategyIOS="hangul-word"
          textBreakStrategy="highQuality"
          style={[styles.description, { color: colors.text.secondary }]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.xxs,
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.medium,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  description: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 21,
  },
});
