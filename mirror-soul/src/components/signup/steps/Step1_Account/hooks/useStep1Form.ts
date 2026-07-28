import { useCountdown } from '@/src/hooks/useCountdown';
import { sendVerificationCode, verifyCode } from '@/src/services/authService';
import { isValidEmail, isValidPassword } from '@/src/utils/validation';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { Step1State } from '../types/step1';

/**
 * 인증 코드 최대 시도 횟수
 * TODO: 백엔드 엔지니어와 협의 후 횟수 및 제한 정책 확정 예정
 * 현재 5회로 설정. 서버 측 제한과 동기화 필요.
 */
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * useStep1Form 훅
 * 회원가입 1단계의 모든 폼 로직과 상태를 캡슐화합니다. (SRP)
 */
export function useStep1Form() {
  const [state, setState] = useState<Step1State>({
    email: '',
    isEmailVerified: false,
    password: '',
    passwordConfirm: '',
    isPasswordVisible: false,
    isPasswordConfirmVisible: false,
    isIdentityVerified: false,
    agreedToTerms: false,
    isAdultConfirmed: false,
    isLoading: false,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEmailActionLoading, setIsEmailActionLoading] = useState(false);
  const [verifyAttemptCount, setVerifyAttemptCount] = useState(0);
  const { timeLeft, isActive: isTimerActive, start: startTimer, reset: resetTimer, formattedTime } = useCountdown(180);

  // 폼 업데이트 함수
  const updateState = useCallback((updates: Partial<Step1State>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // ─────────────────────────────────────────────
  // 이메일 인증 코드 발송 (Optimistic UI 패턴)
  // 즉시 타이머 시작 + 모달 오픈, API 실패 시 롤백
  // ─────────────────────────────────────────────
  const handleSendEmailCode = useCallback(async () => {
    if (isEmailActionLoading) return; // 이메일 인증 요청 중복 방지 Lock

    if (isValidEmail(state.email)) {
      if (isTimerActive && timeLeft > 0) {
        // 이미 인증 코드가 발송되어 타이머가 동작 중일 때는 모달 창만 다시 오픈
        setIsModalVisible(true);
        return;
      }

      // Optimistic UI: 즉시 타이머 시작 + 모달 오픈
      resetTimer();
      startTimer();
      setIsModalVisible(true);
      setVerifyAttemptCount(0); // 재발송 시 시도 횟수 초기화

      try {
        setIsEmailActionLoading(true);
        await sendVerificationCode({ email: state.email });
        // 성공: 이미 타이머 + 모달 동작 중이므로 추가 처리 불필요
      } catch (error: any) {
        // 실패: Optimistic UI 롤백
        resetTimer();
        setIsModalVisible(false);
        Alert.alert(
          '인증 코드 발송 실패',
          error?.message || '잠시 후 다시 시도해주세요.'
        );
      } finally {
        setIsEmailActionLoading(false);
      }
    } else {
      if (__DEV__) {
        console.debug('Invalid email format');
      }
    }
  }, [state.email, isEmailActionLoading, isTimerActive, timeLeft, resetTimer, startTimer, updateState]);

  // ─────────────────────────────────────────────
  // 이메일 인증 코드 확인 (5회 시도 제한)
  // ─────────────────────────────────────────────
  const handleVerifyEmail = useCallback(async (code: string): Promise<boolean> => {
    if (isEmailActionLoading) return false;

    // 인증 시도 횟수 제한
    // TODO: 백엔드 엔지니어와 협의 후 횟수 및 초과 시 정책 확정 예정
    if (verifyAttemptCount >= MAX_VERIFY_ATTEMPTS) {
      Alert.alert(
        '인증 시도 횟수 초과',
        '인증 시도 횟수를 초과했습니다. 인증 코드를 재발송해주세요.'
      );
      return false;
    }

    try {
      setIsEmailActionLoading(true);
      const response = await verifyCode({ code });

      if (response.result.verifySuccess) {
        updateState({ isEmailVerified: true });
        resetTimer(); // 인증 성공 시 구동 중인 타이머 해제
        return true;
      }
      // 명확한 인증 실패(불일치 등) 시에만 시도 횟수 증가
      setVerifyAttemptCount((prev) => prev + 1);
      return false;
    } catch (error: any) {
      if (__DEV__) {
        console.debug('Verify code error:', error?.message);
      }
      return false;
    } finally {
      setIsEmailActionLoading(false);
    }
  }, [isEmailActionLoading, verifyAttemptCount, updateState, resetTimer]);

  // PASS 본인인증 처리 (추후 구현 예정)
  const handlePassVerification = useCallback(() => {
    console.log('PASS Identity Verification requested');
    // Mock logic: 즉시 완료 처리
    updateState({ isIdentityVerified: true });
  }, [updateState]);

  // 다음 단계 이동 가능 여부 체크
  const isFormValid =
    state.isEmailVerified &&
    isValidPassword(state.password) &&
    state.password === state.passwordConfirm &&
    state.isIdentityVerified &&
    state.agreedToTerms &&
    state.isAdultConfirmed;

  return {
    state,
    updateState,
    isModalVisible,
    setIsModalVisible,
    handleSendEmailCode,
    handleVerifyEmail,
    handlePassVerification,
    isFormValid,
    timeLeft,
    isTimerActive,
    formattedTime,
    handleResendCode: handleSendEmailCode,
    verifyAttemptCount,
    isEmailActionLoading,
  };
}
