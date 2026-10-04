import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { savePersonality } from '@/src/services/onboardingService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

import { MbtiScores } from '../Mbti/MbtiSelector';
import { MbtiEnum } from '@/src/types/api/onboarding';

/**
 * useStep3Form 훅
 * Step 3 (MBTI & 자기소개)의 상태 관리 및 API 통신 로직을 담당합니다. (SoC)
 * [보강] MBTI 상세 점수(ieScore, nsScore, ftScore, pjScore)를 포함합니다.
 */
export function useStep3Form(initialMbti: string = '----', initialDescription: string = '') {
  const [mbti, setMbti] = useState(initialMbti);
  const [scores, setScores] = useState<MbtiScores>({
    ieScore: 50,
    nsScore: 50,
    ftScore: 50,
    pjScore: 50,
  });
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);


  // 모든 MBTI가 선택되었고(하이픈 없음), 자기소개가 비어있지 않을 때만 활성화
  const isFormValid = /^[IE][NS][FT][PJ]$/.test(mbti) && description.trim().length > 0;

  const handleSubmit = useCallback(async (onSuccess: () => void) => {

    if (!isFormValid || submitting.current) return;
    submitting.current = true;

    try {
      setIsSubmitting(true);
      const response = await savePersonality({
        mbti: mbti as MbtiEnum,
        ...scores,
        selfIntroduction: description.trim(),
      });

      if (response.isSuccess) {
        // 성격 유형 저장 성공 시 백엔드 상태는 ONBOARD_C가 된다. 화면 이동 전에
        // 앱 상태를 동기화해 전역 라우팅 가드와 일치시킨다.
        await useAuthStore.getState().updateUserStatus('ONBOARD_C');
        onSuccess();
      } else {
        Alert.alert('소개를 저장하지 못했어요', response.message || '입력한 내용은 그대로 있어요. 다시 시도해주세요.');
      }
    } catch (error) {
      Alert.alert('소개를 저장하지 못했어요', getErrorDisplayMessage(error, '입력한 내용은 그대로 있어요. 다시 시도해주세요.'));
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }, [mbti, scores, description, isFormValid]);

  return {
    mbti,
    setMbti,
    scores,
    setScores,
    description,
    setDescription,
    isSubmitting,
    isFormValid,
    handleSubmit,
  };
}
