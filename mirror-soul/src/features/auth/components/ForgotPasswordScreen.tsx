import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import GradientButton from '@/src/components/common/GradientButton';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import AuthInput from '@/src/components/login/parts/AuthInput';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useForgotPasswordFlow } from '../hooks/useForgotPasswordFlow';

/**
 * 비밀번호 찾기 화면 (UI/훅 스캐폴딩)
 * 백엔드에 비밀번호 재설정 엔드포인트가 아직 없어 실제 API 연동 없이
 * 이메일 → 인증코드 → 새 비밀번호 3단계 흐름만 제공한다.
 */
export default function ForgotPasswordScreen() {
  const { colors } = useThemeColors();
  const {
    state,
    setEmail,
    setCode,
    setNewPassword,
    setNewPasswordConfirm,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    isTimerActive,
    formattedTime,
  } = useForgotPasswordFlow();

  return (
    <ScreenLayout withScroll={true}>
      <Header title="비밀번호 찾기" delay={0} />

      <View style={styles.content}>
        {state.step === 'email' && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              가입 시 사용한 이메일로 인증 코드를 보내드립니다.
            </Text>
            <AuthInput
              type="email"
              value={state.email}
              onChangeText={setEmail}
              placeholder="이메일"
              hasError={!!state.emailError}
              returnKeyType="done"
              onSubmitEditing={handleSendCode}
            />
            {!!state.emailError && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {state.emailError}
              </Text>
            )}
            <GradientButton
              title="인증 코드 받기"
              onPress={handleSendCode}
              disabled={state.isLoading}
              isLoading={state.isLoading}
              variant="full"
              style={styles.actionButton}
            />
          </View>
        )}

        {state.step === 'code' && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {state.email}로 전송된 인증 코드를 입력해주세요.
              {isTimerActive && ` (${formattedTime})`}
            </Text>
            <TextInput
              style={[
                styles.codeInput,
                {
                  borderColor: state.codeError ? 'rgba(251, 44, 54, 0.60)' : colors.border.primary,
                  backgroundColor: colors.background.glass,
                  color: colors.text.primary,
                },
              ]}
              value={state.code}
              onChangeText={setCode}
              placeholder="인증 코드 6자리"
              placeholderTextColor={colors.text.muted}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerifyCode}
              accessibilityLabel="인증 코드 입력"
            />
            {!!state.codeError && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {state.codeError}
              </Text>
            )}
            <GradientButton
              title="인증 확인"
              onPress={handleVerifyCode}
              disabled={state.isLoading}
              isLoading={state.isLoading}
              variant="full"
              style={styles.actionButton}
            />
          </View>
        )}

        {state.step === 'reset' && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              새로운 비밀번호를 입력해주세요.
            </Text>
            <AuthInput
              type="password"
              value={state.newPassword}
              onChangeText={setNewPassword}
              placeholder="새 비밀번호"
              hasError={!!state.passwordError}
              returnKeyType="next"
            />
            <AuthInput
              type="password"
              value={state.newPasswordConfirm}
              onChangeText={setNewPasswordConfirm}
              placeholder="새 비밀번호 확인"
              hasError={!!state.passwordError}
              returnKeyType="done"
              onSubmitEditing={handleResetPassword}
            />
            {!!state.passwordError && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {state.passwordError}
              </Text>
            )}
            <GradientButton
              title="비밀번호 재설정"
              onPress={handleResetPassword}
              variant="full"
              style={styles.actionButton}
            />
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
  },
  fieldGroup: {
    width: '100%',
    gap: Spacing.sm,
  },
  description: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.primary.activeRedText,
    paddingLeft: Spacing.xs,
  },
  codeInput: {
    width: '100%',
    height: 57,
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    letterSpacing: -0.312,
  },
  actionButton: {
    marginTop: Spacing.md,
  },
});
