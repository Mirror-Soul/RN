import React, { useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import FormLabel from '@/src/components/signup/common/FormLabel';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { isValidEmail } from '@/src/utils/validation';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { SectionProps } from '../types/step1';
import EmailVerificationModal from './EmailVerificationModal';
import { SIGNUP_KEYBOARD_ACCESSORY_ID } from '@/src/components/signup/common/SignupFormScreen';
import { useSignupFieldColors } from '@/src/components/signup/common/useSignupFieldColors';

interface Props extends SectionProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  onSendCode: () => void;
  onVerify: (code: string) => Promise<boolean>;
  timeLeft?: number;
  isTimerActive?: boolean;
  formattedTime?: string;
  onResendCode?: () => void;
  isLoading?: boolean;
}
export default function EmailSection({ state, onChange, isModalVisible, setIsModalVisible, onSendCode, onVerify, timeLeft = 0, isTimerActive = false, formattedTime = '00:00', onResendCode = onSendCode, isLoading = false }: Props) {
  const { colors } = useThemeColors();
  const fieldColors = useSignupFieldColors();
  const [focused, setFocused] = useState(false);
  const blocked = isLoading || state.isLoading;
  const canSend = isValidEmail(state.email) && !blocked;
  const label = state.isEmailVerified ? '이메일 변경' : isTimerActive && timeLeft > 0 ? '인증 코드 입력' : isTimerActive ? '코드 다시 받기' : '인증 코드 받기';
  const send = () => {
    Keyboard.dismiss();
    if (state.isEmailVerified) onChange({ email: state.email });
    else if (isTimerActive && timeLeft === 0) onResendCode();
    else onSendCode();
  };
  return <View style={styles.container}>
    <FormLabel label="이메일" optional={false} />
    <TextInput accessibilityLabel="이메일 입력란" style={[styles.input, { color: colors.text.primary, backgroundColor: fieldColors.inputBackground, borderColor: state.emailError ? colors.state.danger : focused ? colors.brand.accent : fieldColors.border }]}
      value={state.email} onChangeText={email => onChange({ email })} placeholder="name@example.com" placeholderTextColor={fieldColors.placeholder}
      keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
      inputAccessoryViewID={Platform.OS === 'ios' ? SIGNUP_KEYBOARD_ACCESSORY_ID : undefined} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} editable={!state.isEmailVerified && !blocked} />
    <View style={styles.actions}>
      <Text accessibilityLiveRegion="polite" style={[styles.message, { color: state.emailError ? colors.state.danger : state.isEmailVerified ? colors.state.success : fieldColors.hint }]}>
        {state.emailError || (state.isEmailVerified ? '이메일 인증 완료' : isTimerActive && timeLeft > 0 ? `입력 시간 ${formattedTime}` : '로그인과 인증에 사용할 이메일이에요.')}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !canSend, busy: isLoading }} disabled={!canSend} onPress={send}
        style={[styles.action, { borderColor: canSend ? colors.brand.accent : colors.border.primary }]}>
        {isLoading ? <ActivityIndicator color={colors.brand.accent} size="small" /> : <Text style={[styles.actionText, { color: canSend ? colors.brand.accent : colors.text.muted }]}>{label}</Text>}
      </Pressable>
    </View>
    <EmailVerificationModal isVisible={isModalVisible} email={state.email} onClose={() => setIsModalVisible(false)} onVerify={onVerify} timeLeft={timeLeft} formattedTime={formattedTime} onResend={onResendCode} isLoading={isLoading} />
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  input: { minHeight: 52, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: Radii.md, borderWidth: 1, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  message: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, flexShrink: 1 },
  action: { minHeight: 44, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.md, borderWidth: 1, justifyContent: 'center' },
  actionText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22 },
});
