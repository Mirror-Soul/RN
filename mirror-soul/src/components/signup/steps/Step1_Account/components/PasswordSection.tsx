import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import FormLabel from '@/src/components/signup/common/FormLabel';
import { FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { isValidPassword } from '@/src/utils/validation';
import { SectionProps } from '../types/step1';

export default function PasswordSection({ state, onChange }: SectionProps) {
  const { colors } = useThemeColors();
  const [focused, setFocused] = useState<string | null>(null);
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const valid = isValidPassword(state.password);
  const match = valid && state.password === state.passwordConfirm;
  const fields = [
    { key: 'password' as const, label: '비밀번호', value: state.password, visible: state.isPasswordVisible, invalid: touched.password && !!state.password && !valid,
      hint: valid ? '사용할 수 있는 비밀번호예요.' : '영문과 숫자를 포함해 8~20자로 정해주세요.' },
    { key: 'confirm' as const, label: '비밀번호 확인', value: state.passwordConfirm, visible: state.isPasswordConfirmVisible, invalid: touched.confirm && !!state.passwordConfirm && state.password !== state.passwordConfirm,
      hint: match ? '비밀번호가 일치해요.' : '같은 비밀번호를 한 번 더 입력해주세요.' },
  ];
  return <View style={styles.container}>{fields.map(field => <View key={field.key} style={styles.field}>
    <FormLabel label={field.label} optional={false} />
    <View style={[styles.inputRow, { backgroundColor: colors.background.glass, borderColor: field.invalid ? colors.state.danger : focused === field.key ? colors.brand.accent : colors.border.primary }]}>
      <TextInput accessibilityLabel={field.label} style={[styles.input, { color: colors.text.primary }]} value={field.value}
        onChangeText={text => onChange(field.key === 'password' ? { password: text } : { passwordConfirm: text })}
        placeholder={field.key === 'password' ? '영문·숫자 포함 8~20자' : '비밀번호를 다시 입력해주세요'} placeholderTextColor={colors.text.muted}
        secureTextEntry={!field.visible} autoCapitalize="none" autoCorrect={false} textContentType="newPassword" autoComplete="new-password" editable={!state.isLoading}
        onFocus={() => setFocused(field.key)} onBlur={() => { setFocused(null); setTouched(previous => ({ ...previous, [field.key]: true })); }} />
      <Pressable accessibilityRole="button" accessibilityLabel={`${field.label} ${field.visible ? '숨기기' : '보기'}`} disabled={state.isLoading}
        onPress={() => onChange(field.key === 'password' ? { isPasswordVisible: !field.visible } : { isPasswordConfirmVisible: !field.visible })} style={styles.toggle}>
        <Feather name={field.visible ? 'eye-off' : 'eye'} size={20} color={colors.text.secondary} />
      </Pressable>
    </View>
    <Text style={[styles.hint, { color: field.invalid ? colors.state.danger : (field.key === 'password' ? valid : match) ? colors.state.success : colors.text.secondary }]}>
      {field.invalid ? field.key === 'password' ? '영문과 숫자를 포함해 8~20자로 입력해주세요.' : '비밀번호가 달라요. 다시 확인해주세요.' : field.hint}
    </Text>
  </View>)}</View>;
}
const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  field: { gap: Spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radii.md, paddingLeft: Spacing.md },
  input: { flex: 1, minWidth: 0, minHeight: 52, paddingVertical: Spacing.md, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
  toggle: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  hint: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
});
