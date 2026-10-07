import { useCountdown } from '@/src/hooks/useCountdown';
import { sendVerificationCode, verifyCode } from '@/src/services/authService';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { isValidEmail, isValidPassword } from '@/src/utils/validation';
import { useCallback, useEffect, useRef, useState } from 'react';
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
export function useStep1Form(initialEmail = '') {
  const [state, setState] = useState<Step1State>({
    email: initialEmail,
    isEmailVerified: false,
    password: '',
    passwordConfirm: '',
    isPasswordVisible: false,
    isPasswordConfirmVisible: false,
    isIdentityVerified: false,
    agreedToTerms: false,
    agreedToPrivacy: false,
    isAdultConfirmed: false,
    agreedToBiometricData: false,
    agreedToMarketing: false,
    isLoading: false,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEmailActionLoading, setIsEmailActionLoading] = useState(false);
  const [verifyAttemptCount, setVerifyAttemptCount] = useState(0);
  const { timeLeft, isActive: isTimerActive, start: startTimer, reset: resetTimer, formattedTime } = useCountdown(180);
  const requestLock = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  const issuedEmail = useRef<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current += 1; };
  }, []);

  // 폼 업데이트 함수
  const updateState = useCallback((updates: Partial<Step1State>) => {
    if (updates.email !== undefined) {
      generation.current += 1;
      issuedEmail.current = null;
      resetTimer();
      setIsModalVisible(false);
      setVerifyAttemptCount(0);
    }
    setState((prev) => ({
      ...prev,
      ...updates,
      // 이메일을 다시 수정하면 이전 시도의 인라인 에러(예: 중복 이메일)는 더 이상 유효하지 않다.
      ...(updates.email !== undefined ? { emailError: undefined, emailExists: false, isEmailVerified: false } : null),
    }));
  }, [resetTimer]);

  // ─────────────────────────────────────────────
  // 이메일 인증 코드 발송 (Optimistic UI 패턴)
  // 즉시 타이머 시작 + 모달 오픈, API 실패 시 롤백
  // ─────────────────────────────────────────────
  const handleSendEmailCode = useCallback(async () => {
    if (requestLock.current || isEmailActionLoading) return;

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
      updateState({ emailError: undefined, emailExists: false });
      const session = generation.current;
      requestLock.current = true;
      issuedEmail.current = null;

      try {
        setIsEmailActionLoading(true);
        await sendVerificationCode({ email: state.email });
        if (!mounted.current || session !== generation.current) return;
        issuedEmail.current = state.email;
      } catch (error) {
        if (!mounted.current || session !== generation.current) return;
        // 실패: Optimistic UI 롤백
        resetTimer();
        setIsModalVisible(false);
        if (getErrorCode(error) === 'DUPLICATE_EMAIL') {
          // 이미 가입된 이메일: Alert 대신 입력창 아래 인라인 에러로 표시
          updateState({ emailError: getErrorDisplayMessage(error, '이미 가입된 이메일이에요.'), emailExists: true });
        } else {
          Alert.alert(
            '인증 코드 발송 실패',
            getErrorDisplayMessage(error, '잠시 후 다시 시도해주세요.')
          );
        }
      } finally {
        requestLock.current = false;
        if (mounted.current) setIsEmailActionLoading(false);
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
    if (requestLock.current || isEmailActionLoading || issuedEmail.current !== state.email || timeLeft <= 0 || !/^\d{6}$/.test(code)) return false;

    // 인증 시도 횟수 제한
    // TODO: 백엔드 엔지니어와 협의 후 횟수 및 초과 시 정책 확정 예정
    if (verifyAttemptCount >= MAX_VERIFY_ATTEMPTS) {
      Alert.alert(
        '인증 시도 횟수 초과',
        '인증 시도 횟수를 초과했습니다. 인증 코드를 재발송해주세요.'
      );
      return false;
    }

    const session = generation.current;
    requestLock.current = true;
    try {
      setIsEmailActionLoading(true);
      const response = await verifyCode({ code });
      if (!mounted.current || session !== generation.current) return false;

      if (response.result.verifySuccess) {
        updateState({ isEmailVerified: true });
        resetTimer(); // 인증 성공 시 구동 중인 타이머 해제
        return true;
      }
      // 명확한 인증 실패(불일치 등) 시에만 시도 횟수 증가
      setVerifyAttemptCount((prev) => prev + 1);
      if (verifyAttemptCount + 1 >= MAX_VERIFY_ATTEMPTS) {
        // Switch the dialog to its resend action instead of leaving an unusable code.
        issuedEmail.current = null;
        resetTimer(0);
      }
      return false;
    } catch {
      return false;
    } finally {
      requestLock.current = false;
      if (mounted.current) setIsEmailActionLoading(false);
    }
  }, [state.email, timeLeft, isEmailActionLoading, verifyAttemptCount, updateState, resetTimer]);

  // PASS 본인인증 처리 (연동사 계약 전까지 "준비 중" 안내만 표시)
  // isFormValid에서 제외되어 있으므로 이 버튼은 가입을 막지 않으며,
  // 실제 인증 완료 여부를 허위로 표시하지 않는다.
  const handlePassVerification = useCallback(() => {
    Alert.alert('준비 중입니다', 'PASS 본인인증은 아직 지원되지 않습니다. 빠른 시일 내에 제공할 예정입니다.');
  }, []);

  // 다음 단계 이동 가능 여부 체크
  // NOTE: PASS 본인인증(isIdentityVerified)은 실제 연동 전까지 필수 조건에서 제외한다.
  // 연동 완료 후 이 필드를 다시 필수 조건에 추가할 것.
  const isFormValid =
    state.isEmailVerified &&
    isValidPassword(state.password) &&
    state.password === state.passwordConfirm &&
    state.agreedToTerms &&
    state.agreedToPrivacy &&
    state.agreedToBiometricData &&
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
    requiresNewCode: verifyAttemptCount >= MAX_VERIFY_ATTEMPTS,
    isEmailActionLoading,
  };
}
