import React, { useRef } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Header } from '@/src/components/common/Header';
import AuthInput from '@/src/components/login/parts/AuthInput';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useForgotPasswordFlow } from '../hooks/useForgotPasswordFlow';
import { AuthActionButton } from './AuthActionButton';

/** Recovery shares the login form's native keyboard and safe-area behavior. */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();
  const confirmationRef = useRef<TextInput>(null);
  const {
    state, setEmail, setCode, setNewPassword, setNewPasswordConfirm,
    handleSendCode, handleResendCode, handleVerifyCode, handleResetPassword,
    isTimerActive, formattedTime,
  } = useForgotPasswordFlow();
  const submit = (action: () => Promise<void>) => { Keyboard.dismiss(); void action(); };

  return <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.screen, { backgroundColor: colors.background.primary }]}>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    {/* Header owns the top inset; don't also add it to the SafeAreaView. */}
    <View style={contentContainerStyle}>
      <Header title="비밀번호 찾기" delay={0} onBackPress={() => {
        Keyboard.dismiss();
        if (router.canGoBack()) router.back();
        else router.replace('/login');
      }} />
    </View>
    <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'} automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <View style={[contentContainerStyle, styles.content, { paddingHorizontal: screenPadding }]}>
        {state.step === 'email' && <View style={styles.fieldGroup}>
          <Text style={[styles.description, { color: colors.text.secondary }]}>가입 시 사용한 이메일로 인증 코드를 보내드립니다.</Text>
          <AuthInput type="email" value={state.email} onChangeText={setEmail} placeholder="이메일"
            hasError={!!state.emailError} editable={!state.isLoading} returnKeyType="done" onSubmitEditing={() => submit(handleSendCode)} />
          {!!state.emailError && <Text style={[styles.errorText, { color: colors.state.danger }]} accessibilityRole="alert">{state.emailError}</Text>}
          <View style={styles.actionButton}><AuthActionButton primary title="인증 코드 받기" onPress={() => submit(handleSendCode)} busy={state.isLoading} /></View>
        </View>}

        {state.step === 'code' && <View style={styles.fieldGroup}>
          <Text style={[styles.description, { color: colors.text.secondary }]}>{state.email}로 전송된 인증 코드를 입력해주세요.</Text>
          {isTimerActive && <Text style={[styles.description, { color: colors.text.secondary }]}>입력 시간 {formattedTime}</Text>}
          <TextInput style={[styles.codeInput, { borderColor: state.codeError ? colors.state.danger : colors.border.primary,
            backgroundColor: colors.background.card, color: colors.text.primary }]}
            value={state.code} onChangeText={text => {
              const digits = text.replace(/\D/g, '').slice(0, 6);
              setCode(digits);
              if (digits.length === 6) Keyboard.dismiss();
            }}
            editable={!state.isLoading} placeholder="인증 코드 6자리" placeholderTextColor={colors.text.muted}
            keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code"
            returnKeyType="done" onSubmitEditing={() => submit(handleVerifyCode)} accessibilityLabel="인증 코드 입력" />
          {!!state.codeError && <Text style={[styles.errorText, { color: colors.state.danger }]} accessibilityRole="alert">{state.codeError}</Text>}
          <View style={styles.actionButton}><AuthActionButton primary title="인증 확인" onPress={() => submit(handleVerifyCode)} busy={state.isLoading} /></View>
          <Pressable onPress={() => submit(handleResendCode)} disabled={state.isLoading} style={styles.resend}
            accessibilityRole="button" accessibilityLabel="인증 코드 다시 보내기" accessibilityState={{ disabled: state.isLoading }}>
            <Text style={[styles.description, { color: colors.text.secondary, textAlign: 'center' }]}>인증번호를 못 받으셨나요?</Text>
            <Text style={[styles.resendText, { color: colors.brand.accent }]}>다시 보내기</Text>
          </Pressable>
        </View>}

        {state.step === 'reset' && <View style={styles.fieldGroup}>
          <Text style={[styles.description, { color: colors.text.secondary }]}>새로운 비밀번호를 입력해주세요.</Text>
          <AuthInput type="password" newPassword value={state.newPassword} onChangeText={setNewPassword}
            placeholder="새 비밀번호" accessibilityLabel="새 비밀번호 입력" hasError={!!state.passwordError}
            editable={!state.isLoading} returnKeyType="next" onSubmitEditing={() => confirmationRef.current?.focus()} />
          <AuthInput ref={confirmationRef} type="password" newPassword value={state.newPasswordConfirm} onChangeText={setNewPasswordConfirm}
            placeholder="새 비밀번호 확인" accessibilityLabel="새 비밀번호 확인 입력" hasError={!!state.passwordError}
            editable={!state.isLoading} returnKeyType="done" onSubmitEditing={() => submit(handleResetPassword)} />
          {!!state.passwordError && <Text style={[styles.errorText, { color: colors.state.danger }]} accessibilityRole="alert">{state.passwordError}</Text>}
          <View style={styles.actionButton}><AuthActionButton primary title="비밀번호 재설정" onPress={() => submit(handleResetPassword)} busy={state.isLoading} /></View>
        </View>}
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { paddingTop: Spacing.lg, paddingBottom: Spacing.xxl },
  fieldGroup: { width: '100%', gap: Spacing.sm },
  description: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 23 },
  errorText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20, paddingLeft: Spacing.xs },
  codeInput: { width: '100%', minHeight: 56, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md, borderWidth: 1, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
  actionButton: { marginTop: Spacing.md },
  resend: { minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm },
  resendText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.semibold, lineHeight: 23, textAlign: 'center' },
});
