import { useCallback, useEffect, useState } from 'react';
import { AudioModule, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { INTERVIEW_RECORDING_PRESET } from '@/src/constants/audio';

/**
 * 목소리 정밀 학습용 실제 오디오 파일 녹음 훅.
 *
 * 화면의 실시간 자막(useSTT)과 별도로, 업로드용 원본 오디오 파일을 남기기 위해
 * expo-audio로 동시에 녹음한다. 무손실 녹음 프리셋은 Step4_Interview와 동일한
 * 요건(AI 학습용 음질 보존)이라 INTERVIEW_RECORDING_PRESET을 그대로 재사용한다.
 */
export function useVoiceRecording() {
  const audioRecorder = useAudioRecorder(INTERVIEW_RECORDING_PRESET);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.getRecordingPermissionsAsync();
      setHasPermission(status.granted);
      if (status.granted) {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      }
    })();
  }, []);

  const requestPermission = useCallback(async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    setHasPermission(status.granted);
    if (status.granted) {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    }
    return status.granted;
  }, []);

  // hasPermission(리액트 state)이 아니라 네이티브 모듈에서 매번 새로 조회한다.
  // 호출부(voice-update.tsx)는 requestPermission() 직후 같은 함수 실행 안에서 바로
  // startRecording()을 호출하는데, 그 시점엔 setHasPermission이 아직 리렌더로
  // 반영되기 전이라 이 콜백이 여전히 권한 요청 전(hasPermission=false)의 클로저를
  // 참조한다 — state로 체크하면 방금 허용한 권한인데도 거부로 오판해 던진다.
  const startRecording = useCallback(async () => {
    const status = await AudioModule.getRecordingPermissionsAsync();
    if (!status.granted) {
      throw new Error('마이크 권한이 필요합니다.');
    }
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  }, [audioRecorder]);

  /** 녹음을 멈추고 파일 URI + 녹음 길이(초)를 반환한다. */
  const stopRecording = useCallback(async () => {
    const durationSeconds = recorderState.durationMillis ? recorderState.durationMillis / 1000 : undefined;
    await audioRecorder.stop();
    return { uri: audioRecorder.uri, durationSeconds };
  }, [audioRecorder, recorderState.durationMillis]);

  return {
    isRecording: recorderState.isRecording,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
  };
}
