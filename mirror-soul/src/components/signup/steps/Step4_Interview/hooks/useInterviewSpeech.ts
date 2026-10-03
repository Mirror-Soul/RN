import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AudioModule, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { INTERVIEW_RECORDING_PRESET } from '@/src/constants/audio';

const RECORDING_OPTIONS = { ...INTERVIEW_RECORDING_PRESET, isMeteringEnabled: true };
export function useInterviewSpeech() {
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const audioRecorder = useAudioRecorder(RECORDING_OPTIONS, status => {
    if (status.hasError) setRecordingError('녹음이 중단됐어요. 답변을 확인하고 필요하면 다시 녹음해주세요.');
  });
  const state = useAudioRecorderState(audioRecorder, 150);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);
  const mounted = useRef(true);

  const readPermission = useCallback(async () => {
    const [audio, speech] = await Promise.all([AudioModule.getRecordingPermissionsAsync(), ExpoSpeechRecognitionModule.getPermissionsAsync()]);
    const granted = audio.granted && speech.granted;
    if (mounted.current) {
      setHasPermission(granted);
      setCanAskAgain((audio.granted || audio.canAskAgain) && (speech.granted || speech.canAskAgain));
    }
    return granted;
  }, []);
  useEffect(() => {
    mounted.current = true;
    void readPermission().catch(() => { if (mounted.current) setHasPermission(false); });
    const subscription = AppState.addEventListener('change', next => {
      if (next === 'active') void readPermission().catch(() => {});
    });
    return () => { mounted.current = false; subscription.remove(); };
  }, [readPermission]);

  const requestPermission = useCallback(async () => {
    // Sequential prompts avoid overlapping permission dialogs on iOS.
    const audio = await AudioModule.requestRecordingPermissionsAsync();
    const speech = audio.granted ? await ExpoSpeechRecognitionModule.requestPermissionsAsync() : await ExpoSpeechRecognitionModule.getPermissionsAsync();
    if (mounted.current) {
      setHasPermission(audio.granted && speech.granted);
      setCanAskAgain((audio.granted || audio.canAskAgain) && (speech.granted || speech.canAskAgain));
    }
    return audio.granted && speech.granted;
  }, []);

  const startRecording = useCallback(async () => {
    if (!await readPermission()) throw new Error('녹음하려면 마이크와 음성 인식 권한이 필요해요.');
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    setRecordingError(null);
    // Explicit options create a fresh iOS recorder URL instead of overwriting the previous take.
    await audioRecorder.prepareToRecordAsync(RECORDING_OPTIONS);
    try { audioRecorder.record(); }
    catch (failure) {
      // Android keeps the prepared recorder until stop(), even when record() fails.
      try { await audioRecorder.stop(); } catch { /* Preserve the original start failure. */ }
      throw failure;
    }
  }, [audioRecorder, readPermission]);

  const stopRecording = useCallback(async () => {
    const durationMs = audioRecorder.getStatus().durationMillis;
    await audioRecorder.stop();
    return { uri: audioRecorder.uri, durationMs };
  }, [audioRecorder]);

  return {
    hasPermission, canAskAgain, requestPermission, startRecording, stopRecording, recordingError,
    isRecording: state.isRecording, durationMs: state.durationMillis, metering: state.metering,
  };
}
