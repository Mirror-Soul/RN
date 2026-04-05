import { useState, useCallback } from 'react';
import { Step2State } from '../types/step2';

/**
 * useStep2Form 훅
 * 회원가입 2단계의 모든 폼 로직과 상태를 캡슐화합니다. (SRP)
 */
export function useStep2Form() {
  const [state, setState] = useState<Step2State>({
    nickname: '',
    isNicknameVerified: false,
    location: '',
    jobCategory: '',
    jobTitle: '',
    isJobVerified: false,
  });

  // 폼 업데이트 함수
  const updateState = useCallback((updates: Partial<Step2State>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // 닉네임 중복 확인 처리 (Mock logic)
  const handleNicknameCheck = useCallback(() => {
    if (state.nickname.length >= 2) {
      if (__DEV__) {
        console.debug('Checking nickname availability');
      }
      // Mock: 2자 이상이면 무조건 사용 가능한 것으로 처리
      updateState({ isNicknameVerified: true });
    }
  }, [state.nickname, updateState]);

  // 직업 인증 처리 (Mock logic)
  const handleJobVerify = useCallback(() => {
    if (__DEV__) {
      console.debug('Job verification requested');
    }
    // Mock: 인증 시도 시 성공 처리
    updateState({ isJobVerified: true });
  }, [updateState]);

  // 다음 단계 이동 가능 여부 체크
  // 조건: 닉네임 중복 확인 완료, 지역 선택 완료, 직군 선택 완료
  const isFormValid = 
    state.isNicknameVerified && 
    state.location !== '' && 
    state.jobCategory !== '';

  return {
    state,
    updateState,
    handleNicknameCheck,
    handleJobVerify,
    isFormValid,
  };
}
