import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { login } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { isValidEmail } from '@/src/utils/validation';
import { logger } from '@/src/utils/logger';

interface LoginFormState {
  email: string;
  password: string;
  /** 이메일 필드 하단 인라인 에러 메시지 */
  emailError: string;
  /** 비밀번호 필드 하단 인라인 에러 메시지 */
  passwordError: string;
  /** 로그인 API 실패 시 일반 에러 (필드 구분 없음) */
  generalError: string;
  isSubmitting: boolean;
}

interface UseLoginFormReturn {
  state: LoginFormState;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  handleLogin: () => Promise<void>;
  handleForgotPassword: () => void;
}

const INITIAL_STATE: LoginFormState = {
  email: '',
  password: '',
  emailError: '',
  passwordError: '',
  generalError: '',
  isSubmitting: false,
};

/**
 * useLoginForm 훅
 * 로그인 화면의 모든 폼 상태와 비즈니스 로직을 캡슐화합니다. (SRP)
 *
 * - 인라인 에러 메시지 (Alert 미사용)
 * - 이메일/비밀번호 입력 시 관련 에러 자동 초기화
 * - 비밀번호 찾기: "준비 중" 안내
 */
export function useLoginForm(): UseLoginFormReturn {
  const [state, setState] = useState<LoginFormState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<LoginFormState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setEmail = useCallback(
    (v: string) => updateState({ email: v, emailError: '', generalError: '' }),
    [updateState],
  );

  const setPassword = useCallback(
    (v: string) => updateState({ password: v, passwordError: '', generalError: '' }),
    [updateState],
  );

  const handleLogin = useCallback(async () => {
    if (state.isSubmitting) return;

    // ── 클라이언트 사이드 유효성 검사 ──────────────────────────
    let hasError = false;

    if (!state.email) {
      updateState({ emailError: '이메일을 입력해주세요.' });
      hasError = true;
    } else if (!isValidEmail(state.email)) {
      updateState({ emailError: '올바른 이메일 형식을 입력해주세요.' });
      hasError = true;
    }

    if (!state.password) {
      updateState({ passwordError: '비밀번호를 입력해주세요.' });
      hasError = true;
    }

    if (hasError) return;

    // ── API 호출 ───────────────────────────────────────────────
    try {
      updateState({ isSubmitting: true, generalError: '' });

      const response = await login(state.email, state.password);

      if (response.isSuccess) {
        // Zustand 스토어 업데이트 → _layout.tsx 라우팅 가드가 감지 후 자동 이동 (SoC)
        await useAuthStore.getState().login({
          accessToken: response.result.accessToken,
          refreshToken: response.result.refreshToken,
          userUuid: response.result.userUuid,
          userStatus: response.result.userStatus,
        });
      } else {
        updateState({ generalError: response.message || '이메일 또는 비밀번호를 확인해주세요.' });
      }
    } catch (error: any) {
      logger.warn('useLoginForm: Login failed', error);
      updateState({
        generalError: error?.message || '로그인 처리 중 문제가 발생했습니다.',
      });
    } finally {
      updateState({ isSubmitting: false });
    }
  }, [state.isSubmitting, state.email, state.password, updateState]);

  const handleForgotPassword = useCallback(() => {
    Alert.alert('준비 중', '비밀번호 찾기 기능을 준비 중입니다.');
  }, []);

  return {
    state,
    setEmail,
    setPassword,
    handleLogin,
    handleForgotPassword,
  };
}
