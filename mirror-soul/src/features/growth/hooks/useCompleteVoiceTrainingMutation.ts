import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { completeVoiceUpdate } from '@/src/services/evolveService';
import { logger } from '@/src/utils/logger';
import { useAuthStore } from '@/src/store/useAuthStore';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';
import type { TwinSyncResult } from '@/src/types/api/evolve';

interface CompleteVoiceTrainingParams {
  sentenceId: number;
  recordingUri: string;
  durationSeconds?: number;
}

/**
 * 목소리 정밀 학습 녹음 제출 파이프라인 (Presigned URL 발급 → S3 업로드 → Job 등록)
 * 하나의 mutationFn으로 묶어서, 화면은 mutate 한 번 호출만 신경 쓰면 되도록 한다.
 */
export const useCompleteVoiceTrainingMutation = () => {
  const queryClient = useQueryClient();
  const userUuid = useAuthStore(state => state.userUuid);
  const requireCurrentMember = () => {
    const session = useAuthStore.getState();
    if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
  };

  return useMutation({
    onMutate: () => ({ userUuid }),
    mutationFn: async ({ sentenceId, recordingUri, durationSeconds }: CompleteVoiceTrainingParams) => {
      requireCurrentMember();
      // INTERVIEW_RECORDING_PRESET과 동일한 포맷(iOS: wav, Android: m4a)으로 녹음되므로 그대로 맞춘다.
      const extension = Platform.OS === 'ios' ? 'wav' : 'm4a';
      const contentType = Platform.OS === 'ios' ? 'audio/wav' : 'audio/mp4';
      const fileName = `voice-update-${sentenceId}.${extension}`;

      const presignedResponse = await getPresignedUrl({
        fileName,
        contentType,
        directory: 'voice-updates',
      });
      const { presignedUrl, objectKey } = presignedResponse.result;

      requireCurrentMember();
      await uploadFileToS3(presignedUrl, recordingUri, contentType);

      requireCurrentMember();
      logger.debug('completeVoiceUpdate payload:', { sentenceId, objectKey, durationSeconds });

      return completeVoiceUpdate({
        sentenceId,
        audioObjectKey: objectKey,
        durationSeconds,
      });
    },
    onSuccess: (_response, _params, context) => {
      const session = useAuthStore.getState();
      if (!session.isLoggedIn || session.userUuid !== context?.userUuid) return;
      // Close the gap before GET /evolve refetches, including leaving and reopening this screen.
      queryClient.setQueryData<TwinSyncResult>(profileQueryKeys.twinSync(context.userUuid), previous => previous
        ? { ...previous, lastVoiceTrainingAt: new Date().toISOString() }
        : undefined);
      // 여기의 성공은 학습 작업 접수다. 소개·상태와 다음 낭독 문장을 갱신한다.
      queryClient.invalidateQueries({ queryKey: ['growth', 'twinSync'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'introduction'] });
      queryClient.invalidateQueries({ queryKey: ['growth', 'voiceTrainingSentence'] });
    },
  });
};
