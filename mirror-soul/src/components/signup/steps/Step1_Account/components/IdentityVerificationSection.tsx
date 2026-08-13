import { Feather } from '@expo/vector-icons';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Step1State } from '../types/step1';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface IdentityVerificationSectionProps {
  state: Step1State;
  onVerify: () => void;
}

/**
 * IdentityVerificationSection 컴포넌트 (SRP)
 * PASS 본인인증 버튼 및 완료 상태를 관리합니다.
 */
export default function IdentityVerificationSection({ state, onVerify }: IdentityVerificationSectionProps) {
  const { colors } = useThemeColors();

  if (state.isIdentityVerified) {
    return (
      <View style={[styles.row, styles.rowVerified]}>
        <Feather name="check-circle" size={18} color={Colors.primary.successGreen} />
        <View style={styles.textCol}>
          <Text style={styles.verifiedTitle}>본인인증 완료</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={[styles.row, { borderColor: colors.border.primary }]} onPress={onVerify} activeOpacity={0.7}>
      <Text style={[styles.title, { color: colors.text.primary }]}>본인인증 (PASS)</Text>
      <View style={styles.rightGroup}>
        <Text style={[styles.rightText, { color: colors.text.muted }]}>준비 중</Text>
        <Feather name="chevron-right" size={16} color={colors.text.muted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  rowVerified: {
    borderColor: 'rgba(5, 223, 114, 0.25)',
    backgroundColor: 'rgba(5, 223, 114, 0.06)',
    gap: Spacing.sm,
    justifyContent: 'flex-start',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rightText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  textCol: {
    flexDirection: 'column',
  },
  verifiedTitle: {
    color: Colors.primary.successGreen,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
});
