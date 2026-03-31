import { useState, useEffect, useCallback } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  useAudioRecorderState,
  setAudioModeAsync,
} from 'expo-audio';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { Alert } from 'react-native';
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

  // ─── 마운트 시 권한 요청 및 오디오 모드 설정 ───
  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // ─── 녹음 시작 ───
  const startRecording = useCallback(async () => {
    if (!hasPermission) {
      Alert.alert(
        '마이크 권한 필요',
        '녹음을 시작하려면 마이크 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.'
      );
      return;
    }

    try {
      setRecordingUri(null); // 이전 녹음 URI 초기화
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      Alert.alert('녹음 오류', '녹음을 시작할 수 없습니다. 다시 시도해주세요.');
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
      Alert.alert('녹음 오류', '녹음을 저장하는 중 문제가 발생했습니다.');
    }
  }, [audioRecorder]);

  return {
    isRecording: recorderState.isRecording,
    recordingUri,
    durationMs: recorderState.durationMillis ?? 0,
    hasPermission,
    startRecording,
    stopRecording,
  };
}
