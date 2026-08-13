import {Colors, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';

// StyleSheet 바깥에서 Platform 분기 → React Compiler 호환
const monospaceFont = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

interface Props {
  mbti: string;
}

export default function MbtiBadge({ mbti }: Props) {
  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { borderColor: colors.border.primary }]}>
      <Text style={styles.text}>{mbti}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.sm,
    borderWidth: 1,
    alignSelf: 'center',
  },
  text: {
    color: Colors.primary.electricCyan,
    fontFamily: monospaceFont,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.regular,
    lineHeight: 28,
    letterSpacing: 2,
  },
});
