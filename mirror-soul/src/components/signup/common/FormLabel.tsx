import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import {FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface FormLabelProps {
  label: string;
  optional?: boolean;
}

/**
 * FormLabel 컴포넌트
 * 이메일, 비밀번호 등 각 섹션 상단의 레이블. (SRP)
 */
export default function FormLabel({ label, optional }: FormLabelProps) {
  const { colors } = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.text.primary }]}>{label}</Text>
      {optional !== undefined && <Text style={[styles.badge, { color: colors.text.secondary }]}>{optional ? '선택' : '필수'}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  text: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  badge: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 18 },
});
