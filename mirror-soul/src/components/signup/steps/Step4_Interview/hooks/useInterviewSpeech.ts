import { useState, useEffect, useCallback } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  useAudioRecorderState,
  setAudioModeAsync,
} from 'expo-audio';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { INTERVIEW_RECORDING_PRESET } from '@/src/constants/audio';

/**
 * 인터뷰 녹음 및 음성 상태를 관리하는 커스텀 훅.
 *
 * - expo-audio의 useAudioRecorder를 사용하여 실제 녹음을 수행합니다.
 * - 마이크 권한 요청, 녹음 시작/중지, 파일 URI 관리를 캡슐화합니다.
 * - 추후 백엔드 업로드 로직이 추가될 자리를 마련해 두었습니다.
 */
export function useInterviewSpeech() {
  const audioRecorder = useAudioRecorder(INTERVIEW_RECORDING_PRESET);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // null = 아직 요청 안함

  // ─── 마운트 시 권한 상태 확인 (조용히) ───
  useEffect(() => {
    (async () => {
      const [audioStatus, sttStatus] = await Promise.all([
        AudioModule.getRecordingPermissionsAsync(),
        ExpoSpeechRecognitionModule.getPermissionsAsync(),
      ]);

      const allGranted = audioStatus.granted && sttStatus.granted;
      setHasPermission(allGranted);

      if (allGranted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
    })();
  }, []);

  // ─── 통합 권한 요청 함수 ───
  const requestPermission = useCallback(async () => {
    const [audioStatus, sttStatus] = await Promise.all([
      AudioModule.requestRecordingPermissionsAsync(),
      ExpoSpeechRecognitionModule.requestPermissionsAsync(),
    ]);

    const allGranted = audioStatus.granted && sttStatus.granted;
    setHasPermission(allGranted);

    if (allGranted) {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    }

    return allGranted;
  }, []);

  // ─── 녹음 시작 ───
  const startRecording = useCallback(async () => {
    if (!hasPermission) {
      throw new Error('마이크 권한이 필요합니다.');
    }

    try {
      setRecordingUri(null); // 이전 녹음 URI 초기화
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      return true;
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      throw error;
    }
  }, [hasPermission, audioRecorder]);

  // ─── 녹음 중지 ───
  const stopRecording = useCallback(async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (uri) {
        setRecordingUri(uri);
        // TODO: 추후 백엔드 업로드 로직 추가 위치
      }
    } catch (error) {
      console.error('녹음 중지 실패:', error);
      throw error;
    }
  }, [audioRecorder]);

  return {
    isRecording: recorderState.isRecording,
    recordingUri,
    durationMs: recorderState.durationMillis ?? 0,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
  };
}
