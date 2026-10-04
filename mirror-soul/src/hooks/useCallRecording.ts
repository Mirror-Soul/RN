import { useRef } from 'react';
import { Platform } from 'react-native';
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
import { getPresignedUrl } from '../services/fileService';
import { uploadFileToS3 } from '../services/s3Service';
import { logger } from '../utils/logger';

/**
 * 통화 중 내 음성 녹음 및 S3 업로드 담당 훅 (SoC)
 *
 * - startRecording: WebRTC 연결 성공 시 자동 호출
 * - stopAndUpload: 통화 종료 시 호출 → S3 fileUrl 반환
 *
 * NOTE: directory는 백엔드가 'call-recordings'를 추가하기 전까지
 *       임시로 'interviews'를 사용합니다.
 */
export function useCallRecording() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const isRecordingRef = useRef(false);

  const startRecording = async ({ isCurrent = () => true, managesAudioSession = false }: { isCurrent?: () => boolean; managesAudioSession?: boolean } = {}) => {
    try {
      // 방어적 권한 확인: 이 훅이 독립적으로 재사용될 때도 안전하게 동작하도록 보장
      const { granted } = await AudioModule.getRecordingPermissionsAsync();
      if (!granted) {
        throw new Error('마이크 녹음 권한이 없습니다. 통화 시작 전 권한을 요청해주세요.');
      }

      if (!isCurrent()) return;

      // 독립 녹음에서만 Expo가 세션을 설정한다. 통화 중에는 InCallManager가 관리한다.
      // iOS 전용 — Android에서는 이 호출이 AudioManager.MODE_NORMAL을 강제해 InCallManager가
      // 막 설정한 MODE_IN_COMMUNICATION을 되돌려버리므로(통화 음량 저하 원인), 절대 무해하지
      // 않다. Android 오디오 라우팅은 InCallManager가 전담하도록 여기서는 스킵한다.
      if (Platform.OS === 'ios' && !managesAudioSession) {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      }

      if (!isCurrent()) return;
      await recorder.prepareToRecordAsync();
      // 녹음 준비 중 통화가 종료됐으면 새 녹음을 시작하지 않는다.
      if (!isCurrent()) { await recorder.stop(); return; }
      recorder.record();
      isRecordingRef.current = true;
      logger.debug('[useCallRecording] Recording started');
    } catch (err) {
      logger.error('[useCallRecording] Failed to start recording:', err);
      throw err;
    }
  };

  const stopAndUpload = async (userUuid: string): Promise<string> => {
    if (!isRecordingRef.current) {
      logger.warn('[useCallRecording] stopAndUpload called but not recording');
      return '';
    }

    try {
      // 1. 녹음 중단 및 URI 획득
      await recorder.stop();
      isRecordingRef.current = false;
      const uri = recorder.uri;

      if (!uri) {
        logger.warn('[useCallRecording] Recording URI is null after stop');
        return '';
      }

      logger.debug('[useCallRecording] Recording stopped, uploading to S3...');

      // 2. OS별 파일 설정
      const extension = Platform.OS === 'ios' ? 'wav' : 'm4a';
      const contentType = Platform.OS === 'ios' ? 'audio/wav' : 'audio/mp4';
      const fileName = `call-recording.${extension}`;

      // 3. Presigned URL 발급
      const presignedResponse = await getPresignedUrl({
        fileName,
        contentType,
        // 백엔드의 현재 UploadDirectory 허용값에는 call-recordings가 없다.
        // 전용 디렉터리가 생기기 전까지 음성 파일을 허용된 interviews 경로에 보관한다.
        directory: 'interviews',
      });

      if (!presignedResponse.isSuccess) {
        throw new Error(presignedResponse.message || '업로드 주소 발급에 실패했습니다.');
      }

      const { presignedUrl, fileUrl } = presignedResponse.result;

      // 4. S3 직접 업로드
      await uploadFileToS3(presignedUrl, uri, contentType);
      logger.info('[useCallRecording] Recording uploaded to S3:', fileUrl);

      return fileUrl;
    } catch (err) {
      logger.error('[useCallRecording] stopAndUpload failed:', err);
      // 업로드 실패 시 빈 URL 반환 (통화 종료 자체는 막지 않음)
      return '';
    }
  };

  return { startRecording, stopAndUpload };
}
