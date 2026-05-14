import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { savePersonality } from '@/src/services/onboardingService';
import { useSignupStore } from '@/src/store/useSignupStore';
import { MbtiScores } from '../Mbti/MbtiSelector';
import { MbtiEnum } from '@/src/types/api/onboarding';

/**
 * useStep3Form 훅
 * Step 3 (MBTI & 자기소개)의 상태 관리 및 API 통신 로직을 담당합니다. (SoC)
 * [보강] MBTI 상세 점수(ieScore, nsScore, ftScore, pjScore)를 포함합니다.
 */
export function useStep3Form(initialMbti: string = 'ENFJ', initialDescription: string = '') {
  const [mbti, setMbti] = useState(initialMbti);
  const [scores, setScores] = useState<MbtiScores>({
    ieScore: 50,
    nsScore: 50,
    ftScore: 50,
    pjScore: 50,
  });
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userUuid } = useSignupStore();

  // 모든 MBTI가 선택되었고(하이픈 없음), 자기소개가 비어있지 않을 때만 활성화
  const isFormValid = !mbti.includes('-') && description.trim().length > 0;

  const handleSubmit = useCallback(async (onSuccess: () => void) => {
    if (!userUuid) {
      Alert.alert('오류', '사용자 정보가 없습니다. 처음부터 다시 시도해주세요.');
      return;
    }

    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await savePersonality(userUuid, {
        mbti: mbti as MbtiEnum,
        ...scores,
        selfIntroduction: description.trim(),
      });

      if (response.isSuccess) {
        onSuccess();
      } else {
        const errorDetail = response.code ? `\n[Error Code: ${response.code}]` : '';
        Alert.alert('저장 실패', `${response.message || '정보 저장 중 오류가 발생했습니다.'}${errorDetail}`);
      }
    } catch (error: any) {
      Alert.alert('오류', error?.message || '네트워크 통신 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [mbti, scores, description, isFormValid, isSubmitting, userUuid]);

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
