import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Step2State } from '../types/step2';
import { checkNicknameDuplicate } from '@/src/services/onboardingService';
import { jobCategories } from '../Professional/jobData';


/**
 * useStep2Form 훅
 * 회원가입 2단계의 모든 폼 로직과 상태를 캡슐화합니다. (SRP)
 */
export function useStep2Form() {
  const [state, setState] = useState<Step2State>({
    nickname: '',
    isNicknameVerified: false,
    isNicknameChecking: false,
    sidoName: '',
    sigunguName: '',
    eupmyeondongName: '',
    jobCategory: '',
    jobTitle: '',
  });

  // 지역 데이터 캐시 (성능 최적화: 드롭다운이 닫혀도 유지)
  const sigunguCache = useRef<Map<string, string[]>>(new Map());
  const eupmyeondongCache = useRef<Map<string, string[]>>(new Map());

  // 폼 업데이트 함수
  const updateState = useCallback((updates: Partial<Step2State>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // 닉네임 중복 확인 처리
  const handleNicknameCheck = useCallback(async () => {
    if (state.nickname.trim().length < 2) {
      Alert.alert('알림', '닉네임은 2자 이상 입력해주세요.');
      return;
    }
    if (state.isNicknameChecking) return;

    try {
      updateState({ isNicknameChecking: true });
      const response = await checkNicknameDuplicate({ nickname: state.nickname.trim() });

      // 백엔드는 사용 가능/중복 두 경우 모두 isSuccess: true로 응답한다(실패는 네트워크/서버
      // 에러 때만) — 실제 사용 가능 여부는 response.result.available로 판단해야 한다.
      if (response.result?.available) {
        updateState({ isNicknameVerified: true });
      } else {
        Alert.alert('닉네임 중복', '이미 사용 중인 닉네임입니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', error?.message || '닉네임 확인 중 오류가 발생했습니다.');
    } finally {
      updateState({ isNicknameChecking: false });
    }
  }, [state.nickname, state.isNicknameChecking, updateState]);

  // 다음 단계 이동 가능 여부 체크 (SoC: 도메인 검증 로직 통합)
  // 조건: 닉네임 중복 확인 완료, 지역 선택 완료, 유효한 직군 선택 완료
  const isFormValid = 
    state.isNicknameVerified && 
    state.sidoName !== '' && 
    state.sigunguName !== '' && 
    state.eupmyeondongName !== '' && 
    jobCategories.some((j) => j.value === state.jobCategory);

  return {
    state,
    updateState,
    handleNicknameCheck,
    isFormValid,
    sigunguCache,
    eupmyeondongCache,
  };
}
