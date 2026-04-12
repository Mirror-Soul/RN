import { useState, useCallback } from 'react';
import { Step1State } from '../types/step1';
import { isValidEmail } from '@/src/utils/validation';
import { useCountdown } from '@/src/hooks/useCountdown';

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
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const { timeLeft, isActive: isTimerActive, start: startTimer, reset: resetTimer, formattedTime } = useCountdown(180);

  // 폼 업데이트 함수
  const updateState = useCallback((updates: Partial<Step1State>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // 이메일 인증 발송 처리 (모달 팝업 및 타이머 연동)
  const handleSendEmailCode = useCallback(() => {
    if (isValidEmail(state.email)) {
      if (isTimerActive && timeLeft > 0) {
        // 이미 인증 코드가 발송되어 타이머가 동작 중일 때는 모달 창만 다시 오픈
        setIsModalVisible(true);
      } else {
        // 인증 코드 초기 발송 혹은 시간 만료 후 재발송 액션
        resetTimer();
        startTimer();
        setIsModalVisible(true);
      }
    } else {
      console.log('Invalid email');
    }
  }, [state.email, isTimerActive, timeLeft, resetTimer, startTimer]);

  // 이메일 인증 확인 처리 (모달 확인 클릭)
  const handleVerifyEmail = useCallback((code: string) => {
    if (__DEV__) {
      console.debug('Verifying email code length:', code.length);
    }
    
    // UI 테스트용 임시 Mock: '111111' 입력 시 무조건 실패 처리하여 에러 화면 확인
    if (code === '111111') {
      return false;
    }

    // Mock logic: 그 외 6자리 코드면 무조건 성공 처리
    if (code.length === 6) {
      updateState({ isEmailVerified: true });
      resetTimer(); // 인증 성공 시 구동 중인 타이머 해제
      return true;
    }
    return false;
  }, [updateState, resetTimer]);

  // PASS 본인인증 처리 (Mock)
  const handlePassVerification = useCallback(() => {
    console.log('PASS Identity Verification requested');
    // Mock logic: 즉시 완료 처리
    updateState({ isIdentityVerified: true });
  }, [updateState]);

  // 다음 단계 이동 가능 여부 체크
  const isFormValid = 
    state.isEmailVerified && 
    state.password.length >= 8 && 
    state.password === state.passwordConfirm && 
    state.isIdentityVerified && 
    state.agreedToTerms;

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
  };
}
