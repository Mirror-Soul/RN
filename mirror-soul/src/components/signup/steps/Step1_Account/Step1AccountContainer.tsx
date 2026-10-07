import React, { useRef } from 'react';
import { Alert, Keyboard, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';
import { FontFamily, FontSize, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { getAuthEntryEmail } from '@/src/features/auth/onboardingResume';
import { isValidPassword } from '@/src/utils/validation';
import SignupFormScreen from '@/src/components/signup/common/SignupFormScreen';
import SignupSection from '@/src/components/signup/common/SignupSection';
import AgeVerificationSection from './components/AgeVerificationSection';
import AgreementSection from './components/AgreementSection';
import EmailSection from './components/EmailSection';
import PasswordSection from './components/PasswordSection';
import Step1Header from './components/Step1Header';
import { useStep1Form } from './hooks/useStep1Form';
import { useCreateAccountMutation } from './hooks/useCreateAccountMutation';

export default function Step1AccountContainer() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const form = useStep1Form(getAuthEntryEmail(email));
  const { state, updateState, isFormValid } = form;
  const createAccountMutation = useCreateAccountMutation();
  const submitting = useRef(false);
  const hint = state.emailExists ? '이미 만든 계정으로 로그인하면 가입을 이어갈 수 있어요.'
    : !state.isEmailVerified ? '가입할 이메일을 입력하고 인증해주세요.'
    : !isValidPassword(state.password) ? '비밀번호는 영문과 숫자를 포함해 8~20자로 정해주세요.'
    : state.password !== state.passwordConfirm ? '같은 비밀번호를 한 번 더 입력해주세요.'
    : !isFormValid ? '만 19세 이상 여부와 필수 동의 항목을 확인해주세요.'
    : '다음으로 상대에게 보여줄 프로필을 만들어요.';

  const handleContinue = async () => {
    if (state.emailExists) { handleExistingAccountLogin(); return; }
    if (!isFormValid || submitting.current) return;
    submitting.current = true;
    updateState({ isLoading: true });
    try {
      await createAccountMutation.mutateAsync({
        email: state.email, password: state.password,
        gender: null, birthDate: null,
        termsAgreed: state.agreedToTerms && state.agreedToPrivacy,
      });
      router.replace(SIGNUP_ROUTES.PROFILE);
    } catch (error) {
      if (getErrorCode(error) === 'DUPLICATE_EMAIL') {
        updateState({ emailError: getErrorDisplayMessage(error, '이미 가입된 이메일이에요.'), emailExists: true, isEmailVerified: false });
      } else Alert.alert('계정을 만들지 못했어요', getErrorDisplayMessage(error, '잠시 후 다시 시도해주세요.'));
    } finally {
      submitting.current = false;
      updateState({ isLoading: false });
    }
  };

  const handleExistingAccountLogin = () => {
    Keyboard.dismiss();
    router.replace({ pathname: '/login', params: { email: state.email, notice: 'existing-account' } });
  };

  return <SignupFormScreen title={state.emailExists ? '로그인하고 계속' : '계정 만들고 계속'} hint={hint} disabled={!isFormValid && !state.emailExists} isSubmitting={state.isLoading} submittingLabel="계정을 만들고 있어요…" onContinue={() => void handleContinue()}>
    <Step1Header />
    <SignupSection title="로그인 정보" icon="key">
      <EmailSection state={state} onChange={updateState} isModalVisible={form.isModalVisible} setIsModalVisible={form.setIsModalVisible}
        onSendCode={form.handleSendEmailCode} onVerify={form.handleVerifyEmail} timeLeft={form.timeLeft} isTimerActive={form.isTimerActive}
        formattedTime={form.formattedTime} onResendCode={form.handleResendCode} isLoading={form.isEmailActionLoading} requiresNewCode={form.requiresNewCode}
        onExistingAccountLogin={handleExistingAccountLogin} />
      <PasswordSection state={state} onChange={updateState} />
    </SignupSection>
    <SignupSection compact title="이용 전 확인해주세요" description="필수 항목에 동의하면 가입을 계속할 수 있어요. 마케팅 수신은 선택이에요.">
      <View style={styles.confirmations}>
        <AgeVerificationSection state={state} onChange={updateState} />
        <AgreementSection state={state} onChange={updateState} />
      </View>
    </SignupSection>
    <Text style={[styles.note, { color: colors.text.secondary }]}>연령 확인은 현재 본인이 만 19세 이상임을 직접 확인하는 방식이에요.</Text>
  </SignupFormScreen>;
}
const styles = StyleSheet.create({
  confirmations: { gap: Spacing.xs },
  note: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
});
