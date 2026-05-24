import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { saveInterviewAnswer } from '@/src/services/onboardingService';
import { useSignupStore } from '@/src/store/useSignupStore';
import { logger } from '@/src/utils/logger';

/**
 * 인터뷰 오디오 업로드 및 답변 저장 파이프라인을 관리하는 커스텀 훅 (SoC)
 */
export function useInterviewUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userUuid } = useSignupStore();

  const uploadInterviewAudio = useCallback(async (
    recordingUri: string, 
    questionId: number,
    answerText: string
  ) => {
    if (!userUuid) {
      throw new Error('사용자 정보가 없습니다. 다시 시도해주세요.');
    }

    // 1. 텍스트 검증 (Q5 답변: AI 학습을 위한 품질 확보)
    if (!answerText || answerText.trim().length < 5) {
      Alert.alert(
        '알림', 
        '음성이 명확하게 들리지 않습니다. 조금 더 길고 명확하게 답변해 주세요.'
      );
      return false;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 2. 플랫폼별 설정 및 Presigned URL 발급
      const extension = Platform.OS === 'ios' ? 'wav' : 'm4a';
      const contentType = Platform.OS === 'ios' ? 'audio/wav' : 'audio/mp4';
      const fileName = `interview-answer-${questionId}.${extension}`;

      const presignedResponse = await getPresignedUrl({
        userUuid,
        fileName,
        contentType,
        directory: 'interviews',
      });

      if (!presignedResponse.isSuccess) {
        throw new Error(presignedResponse.message || '업로드 주소 발급에 실패했습니다.');
      }

      const { presignedUrl, objectKey } = presignedResponse.result;

      // 3. S3 직접 업로드
      await uploadFileToS3(presignedUrl, recordingUri, contentType);

      // 4. 인터뷰 답변 최종 저장 (Onboarding Domain DB)
      // [API 변경 반영] completeFileUpload가 제거되고, URL 대신 objectKey를 전송합니다.
      logger.debug('Final payload before saving:', {
        userUuid,
        interviewId: questionId,
        objectKey,
        answerTextLen: answerText.trim().length
      });

      const saveResponse = await saveInterviewAnswer(userUuid, {
        interviewId: questionId,
        answerAudioObjectKey: objectKey,
        answerText: answerText.trim(),
      });

      if (!saveResponse.isSuccess) {
        throw new Error(saveResponse.message || '답변 저장에 실패했습니다.');
      }

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '인터뷰 업로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [userUuid]);

  return {
    uploadInterviewAudio,
    isUploading,
    error,
  };
}
