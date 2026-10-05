import React, { forwardRef, useState } from 'react';
import { Pressable, ReturnKeyTypeOptions, StyleSheet, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface AuthInputProps {
  type: 'email' | 'password'; value: string; onChangeText: (text: string) => void;
  placeholder?: string; hasError?: boolean; onSubmitEditing?: () => void;
  returnKeyType?: ReturnKeyTypeOptions; editable?: boolean; newPassword?: boolean;
  accessibilityLabel?: string;
  appearance?: 'default' | 'plain';
}
const AuthInput = forwardRef<TextInput, AuthInputProps>(({
  type, value, onChangeText, placeholder, hasError = false, onSubmitEditing, returnKeyType, editable = true, newPassword = false, accessibilityLabel, appearance = 'default',
}, ref) => {
  const { colors } = useThemeColors();
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const password = type === 'password';
  const plain = appearance === 'plain';
  return <View style={[styles.container, plain && styles.plain, { backgroundColor: plain ? 'transparent' : colors.background.card, borderColor: hasError ? colors.state.danger : focused ? colors.brand.accent : plain ? 'transparent' : colors.border.primary }]}>
    {!plain && <Feather accessible={false} name={password ? 'lock' : 'mail'} size={18} color={colors.text.secondary} />}
    <TextInput ref={ref} style={[styles.input, { color: colors.text.primary }]}
      value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.text.muted}
      editable={editable} secureTextEntry={password && !passwordVisible} autoCapitalize="none" autoCorrect={false}
      keyboardType={password ? 'default' : 'email-address'}
      textContentType={password ? newPassword ? 'newPassword' : 'password' : 'username'}
      autoComplete={password ? newPassword ? 'new-password' : 'current-password' : 'username'}
      returnKeyType={returnKeyType} onSubmitEditing={onSubmitEditing}
      submitBehavior={returnKeyType === 'next' ? 'submit' : 'blurAndSubmit'}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      underlineColorAndroid="transparent" accessibilityLabel={accessibilityLabel ?? (password ? '비밀번호 입력' : '이메일 입력')}
      accessibilityHint={hasError ? '입력 내용을 확인해주세요.' : undefined} />
    {password && <Pressable onPress={() => setPasswordVisible(previous => !previous)} disabled={!editable}
      accessibilityRole="button" accessibilityLabel={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
      accessibilityState={{ selected: passwordVisible, disabled: !editable }} style={styles.visibility}>
      <Feather name={passwordVisible ? 'eye-off' : 'eye'} size={20} color={colors.text.secondary} />
    </Pressable>}
  </View>;
});
AuthInput.displayName = 'AuthInput';
export default AuthInput;
const styles = StyleSheet.create({
  container: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: Radii.md, paddingLeft: Spacing.md, paddingRight: Spacing.xs },
  plain: { minHeight: 52, borderWidth: 0, borderBottomWidth: 1, borderRadius: 0, paddingLeft: 0, paddingRight: 0 },
  input: { flex: 1, minWidth: 0, paddingVertical: Spacing.md, paddingHorizontal: 0, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
  visibility: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
