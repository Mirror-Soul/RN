import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useCountdown } from '@/src/hooks/useCountdown';
import { isValidEmail, isValidPassword } from '@/src/utils/validation';

/**
 * 비밀번호 찾기 단계. 백엔드에 관련 엔드포인트가 아직 없어(로그인/회원가입/refresh/logout뿐)
 * 이 훅은 UI 흐름만 제공하고 실제 API 호출은 하지 않는다.
 * TODO: 백엔드에 /auth/password/send-code, /auth/password/verify-code, /auth/password/reset 엔드포인트가
 * 추가되면 아래 스텁들을 실제 authService 호출로 교체한다.
 */
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

/** 백엔드 연동 전까지 UX만 흉내내기 위한 가짜 네트워크 지연 */
const STUB_DELAY_MS = 600;

export function useForgotPasswordFlow() {
  const [state, setState] = useState<ForgotPasswordState>(INITIAL_STATE);
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
    // TODO: authService.sendPasswordResetCode({ email: state.email }) 로 교체
    await new Promise((resolve) => setTimeout(resolve, STUB_DELAY_MS));

    resetTimer();
    startTimer();
    updateState({ isLoading: false, step: 'code' });
  }, [state.isLoading, state.email, updateState, resetTimer, startTimer]);

  const handleVerifyCode = useCallback(async () => {
    if (state.isLoading) return;

    if (!state.code || state.code.length < 6) {
      updateState({ codeError: '인증 코드 6자리를 입력해주세요.' });
      return;
    }

    updateState({ isLoading: true });
    // TODO: authService.verifyPasswordResetCode({ email: state.email, code: state.code }) 로 교체
    await new Promise((resolve) => setTimeout(resolve, STUB_DELAY_MS));

    resetTimer();
    updateState({ isLoading: false, step: 'reset' });
  }, [state.isLoading, state.code, updateState, resetTimer]);

  const handleResetPassword = useCallback(() => {
    if (!isValidPassword(state.newPassword)) {
      updateState({ passwordError: '영문+숫자 포함 8~20자로 입력해주세요.' });
      return;
    }
    if (state.newPassword !== state.newPasswordConfirm) {
      updateState({ passwordError: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    // 백엔드에 비밀번호 재설정 엔드포인트가 아직 없어 여기서 더 진행하지 않는다.
    Alert.alert('준비 중', '비밀번호 재설정 기능을 준비 중입니다.');
  }, [state.newPassword, state.newPasswordConfirm, updateState]);

  return {
    state,
    setEmail,
    setCode,
    setNewPassword,
    setNewPasswordConfirm,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    timeLeft,
    isTimerActive,
    formattedTime,
  };
}
