import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export const DeleteConsentSection = ({ isAgreed, onToggleAgree, onSubmit, disabled = false }: { isAgreed: boolean; onToggleAgree: () => void; onSubmit: () => void; disabled?: boolean }) => {
  const { colors } = useThemeColors();
  return <View style={styles.content}>
    <Pressable disabled={disabled} onPress={onToggleAgree} accessibilityRole="checkbox" accessibilityState={{ checked: isAgreed, disabled }} accessibilityLabel="탈퇴 안내 및 복구 기간 확인" style={styles.checkboxRow}><View style={[styles.checkbox, { borderColor: isAgreed ? colors.state.danger : colors.border.strong, backgroundColor: colors.background.glass }]}>{isAgreed && <Feather name="check" size={18} color={colors.state.danger} />}</View><Text style={[styles.copy, { color: colors.text.primary }]}>탈퇴 안내와 복구 기간을 확인했어요.</Text></Pressable>
    <Pressable disabled={!isAgreed || disabled} onPress={onSubmit} accessibilityRole="button" accessibilityLabel="회원 탈퇴 최종 확인" accessibilityState={{ disabled: !isAgreed || disabled }} style={[styles.button, { borderColor: isAgreed ? colors.state.danger : colors.border.primary, backgroundColor: colors.background.glass, opacity: !isAgreed || disabled ? 0.5 : 1 }]}><Text style={[styles.buttonText, { color: isAgreed ? colors.state.danger : colors.text.secondary }]}>회원 탈퇴 계속하기</Text></Pressable>
    <Text style={[styles.hint, { color: colors.text.secondary }]}>다음 화면에서 한 번 더 확인해요.</Text>
  </View>;
};
const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  checkboxRow: { minHeight: 48, flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', paddingVertical: Spacing.sm },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderRadius: Radii.sm, justifyContent: 'center', alignItems: 'center' },
  copy: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 24 },
  button: { minHeight: 52, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 25, textAlign: 'center' },
  hint: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, textAlign: 'center' },
});
