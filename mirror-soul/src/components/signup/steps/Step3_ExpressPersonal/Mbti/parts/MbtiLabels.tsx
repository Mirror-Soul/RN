import {Colors, Radii, FontSize, Spacing} from '@/src/constants/theme';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

const monospaceFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface Props {
  leftChar: string;
  leftLabel: string;
  rightChar: string;
  rightLabel: string;
  value: number;
  percentageText: string;
}

export default function MbtiLabels({
  leftChar,
  leftLabel,
  rightChar,
  rightLabel,
  value,
  percentageText,
}: Props) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.header}>
      <View style={styles.labelGroup}>
        <View style={[styles.charBox, { borderColor: colors.border.primary, backgroundColor: colors.background.glass }, value < 50 && styles.charBoxActiveLeft]}>
          <Text style={[styles.charText, { color: colors.text.primary }]}>{leftChar}</Text>
        </View>
        <Text style={[styles.labelText, { color: colors.text.secondary }]}>{leftLabel}</Text>
      </View>

      <Text style={[styles.percentageText, { color: colors.text.muted }]}>{percentageText}</Text>

      <View style={styles.labelGroup}>
        <Text style={[styles.labelText, { color: colors.text.secondary }]}>{rightLabel}</Text>
        <View style={[styles.charBox, { borderColor: colors.border.primary, backgroundColor: colors.background.glass }, value > 50 && styles.charBoxActiveRight]}>
          <Text style={[styles.charText, { color: colors.text.primary }]}>{rightChar}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  charBox: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.612,
  },
  charBoxActiveLeft: {
    borderColor: Colors.glass.purple80,
    backgroundColor: Colors.glass.purple30_mbti,
  },
  charBoxActiveRight: {
    borderColor: Colors.glass.cyan80,
    backgroundColor: Colors.glass.cyan30,
  },
  charText: {
    fontFamily: monospaceFont,
    fontSize: FontSize.base,
  },
  labelText: {
    fontSize: FontSize.base,
    letterSpacing: -0.15,
  },
  percentageText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    flex: 1,
  },
});
