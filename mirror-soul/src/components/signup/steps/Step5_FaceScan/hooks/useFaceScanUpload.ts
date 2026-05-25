import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { saveFaceScan } from '@/src/services/onboardingService';
import { useSignupStore } from '@/src/store/useSignupStore';
import { logger } from '@/src/utils/logger';

/**
 * 3D Face Scan 비디오 업로드 파이프라인 (SoC)
 * 영상 처리 완료 후 S3 업로드 및 백엔드 동기화를 담당합니다.
 */
export function useFaceScanUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userUuid } = useSignupStore();

  const uploadFaceVideo = useCallback(async (videoUri: string) => {
    if (!userUuid) {
      throw new Error('사용자 정보가 없습니다. 다시 시도해주세요.');
    }

    setIsUploading(true);
    setError(null);

    try {
      // OS별로 카메라 영상 확장자 및 Content-Type이 다름
      const extension = Platform.OS === 'ios' ? 'mov' : 'mp4';
      const contentType = Platform.OS === 'ios' ? 'video/quicktime' : 'video/mp4';
      const fileName = `face-scan.${extension}`;

      // 1. Presigned URL 발급
      const presignedResponse = await getPresignedUrl({
        userUuid,
        fileName,
        contentType,
        directory: 'face-videos',
      });

      if (!presignedResponse.isSuccess) {
        throw new Error(presignedResponse.message || '업로드 주소 발급에 실패했습니다.');
      }

      const { presignedUrl, objectKey, fileUrl } = presignedResponse.result;

      // 2. S3 직접 업로드
      await uploadFileToS3(presignedUrl, videoUri, contentType);

      // 3. 서버에 결과 최종 저장
      logger.debug('Face scan upload payload before saving:', { objectKey });
      const saveResponse = await saveFaceScan({
        fileUrl,
        objectKey,
      });

      if (!saveResponse.isSuccess) {
        throw new Error(saveResponse.message || '얼굴 스캔 데이터 저장에 실패했습니다.');
      }

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [userUuid]);

  return {
    uploadFaceVideo,
    isUploading,
    error,
  };
}
