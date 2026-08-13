import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface FormLabelProps {
  label: string;
}

/**
 * FormLabel 컴포넌트
 * 이메일, 비밀번호 등 각 섹션 상단의 레이블. (SRP)
 */
export default function FormLabel({ label }: FormLabelProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
    alignSelf: 'stretch',
  },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    letterSpacing: 0.1,
  },
});
