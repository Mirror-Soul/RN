import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCountdown } from '@/src/hooks/useCountdown';
import { isValidEmail, isValidPassword } from '@/src/utils/validation';
import { sendPasswordResetCode, verifyPasswordResetCode, resetPassword } from '@/src/services/authService';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

/**
 * 비밀번호 찾기 단계 — 이메일 인증(send-code/verify-code)은 회원가입(useStep1Form.ts)과
 * 동일한 세션 기반 백엔드(HttpSession)를 쓰므로 같은 패턴(react-query 아닌 순수 async + 로컬
 * state)을 따른다. reset은 토큰을 발급하지 않아 useAuthStore 연동이 필요 없다.
 */
const MAX_VERIFY_ATTEMPTS = 5; // 백엔드 PasswordResetService.VERIFY_MAX_COUNT와 동일

type ForgotPasswordStep = 'email' | 'code' | 'reset';

interface ForgotPasswordState {
  step: ForgotPasswordStep;
  email: string;
  emailError: string;
  code: string;
  codeError: string;
  newPassword: string;
  newPasswordConfirm: string;
  passwordError: string;
  isLoading: boolean;
}

const INITIAL_STATE: ForgotPasswordState = {
  step: 'email',
  email: '',
  emailError: '',
  code: '',
  codeError: '',
  newPassword: '',
  newPasswordConfirm: '',
  passwordError: '',
  isLoading: false,
};

export function useForgotPasswordFlow() {
  const router = useRouter();
  const [state, setState] = useState<ForgotPasswordState>(INITIAL_STATE);
  const [verifyAttemptCount, setVerifyAttemptCount] = useState(0);
  const { timeLeft, isActive: isTimerActive, start: startTimer, reset: resetTimer, formattedTime } = useCountdown(180);

  const updateState = useCallback((updates: Partial<ForgotPasswordState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setEmail = useCallback(
    (v: string) => updateState({ email: v, emailError: '' }),
    [updateState],
  );

  const setCode = useCallback(
    (v: string) => updateState({ code: v, codeError: '' }),
    [updateState],
  );

  const setNewPassword = useCallback(
    (v: string) => updateState({ newPassword: v, passwordError: '' }),
    [updateState],
  );

  const setNewPasswordConfirm = useCallback(
    (v: string) => updateState({ newPasswordConfirm: v, passwordError: '' }),
    [updateState],
  );

  const handleSendCode = useCallback(async () => {
    if (state.isLoading) return;

    if (!isValidEmail(state.email)) {
      updateState({ emailError: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }

    updateState({ isLoading: true });
    try {
      await sendPasswordResetCode({ email: state.email });
      setVerifyAttemptCount(0); // 재전송 시 시도 횟수 초기화(백엔드도 send-code 재호출 시 리셋)
      resetTimer();
      startTimer();
      updateState({ isLoading: false, step: 'code', code: '', codeError: '' });
    } catch (error) {
      updateState({ isLoading: false, emailError: getErrorDisplayMessage(error, '인증 코드 발송에 실패했습니다.') });
    }
  }, [state.isLoading, state.email, updateState, resetTimer, startTimer]);

  /** "다시 보내기" — 백엔드가 send-code 재호출 시 이전 코드/시도횟수/차단상태를 전부 리셋하므로 재전송과 동일하다. */
  const handleResendCode = handleSendCode;

  const handleVerifyCode = useCallback(async () => {
    if (state.isLoading) return;

    if (!state.code || state.code.length < 6) {
      updateState({ codeError: '인증 코드 6자리를 입력해주세요.' });
      return;
    }

    if (verifyAttemptCount >= MAX_VERIFY_ATTEMPTS) {
      Alert.alert('인증 시도 횟수 초과', '인증 시도 횟수를 초과했습니다. 인증 코드를 다시 보내주세요.');
      return;
    }

    updateState({ isLoading: true });
    try {
      await verifyPasswordResetCode({ code: state.code });
      resetTimer();
      updateState({ isLoading: false, step: 'reset' });
    } catch (error) {
      if (getErrorCode(error) === 'EMAIL_CODE_ATTEMPT_EXCEEDED') {
        updateState({ isLoading: false });
        Alert.alert('인증 시도 횟수 초과', '인증 시도 횟수를 초과했습니다. 인증 코드를 다시 보내주세요.');
        return;
      }
      setVerifyAttemptCount((prev) => prev + 1);
      updateState({ isLoading: false, codeError: getErrorDisplayMessage(error, '인증번호가 일치하지 않습니다.') });
    }
  }, [state.isLoading, state.code, verifyAttemptCount, updateState, resetTimer]);

  const handleResetPassword = useCallback(async () => {
    if (state.isLoading) return;

    if (!isValidPassword(state.newPassword)) {
      updateState({ passwordError: '영문+숫자 포함 8~20자로 입력해주세요.' });
      return;
    }
    if (state.newPassword !== state.newPasswordConfirm) {
      updateState({ passwordError: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    updateState({ isLoading: true });
    try {
      await resetPassword({ newPassword: state.newPassword, newPasswordConfirm: state.newPasswordConfirm });
      // reset 응답엔 토큰이 없어 자동 로그인은 불가 — 로그인 화면으로 돌려보낸다.
      Alert.alert('비밀번호 재설정 완료', '새 비밀번호로 로그인해주세요.', [
        { text: '확인', onPress: () => router.replace('/login') },
      ]);
    } catch (error) {
      updateState({ isLoading: false, passwordError: getErrorDisplayMessage(error, '비밀번호 재설정에 실패했습니다.') });
    }
  }, [state.isLoading, state.newPassword, state.newPasswordConfirm, updateState, router]);

  return {
    state,
    setEmail,
    setCode,
    setNewPassword,
    setNewPasswordConfirm,
    handleSendCode,
    handleResendCode,
    handleVerifyCode,
    handleResetPassword,
    timeLeft,
    isTimerActive,
    formattedTime,
  };
}
