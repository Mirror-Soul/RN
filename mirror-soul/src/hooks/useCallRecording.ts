import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';
import { getPresignedUrl } from '../services/fileService';
import { uploadFileToS3 } from '../services/s3Service';
import { useAuthStore } from '../store/useAuthStore';
import { logger } from '../utils/logger';

/** Separate microphone recording. Muted sections must never be uploaded. */
export function useCallRecording() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const phase = useRef<'idle' | 'preparing' | 'ready' | 'recording' | 'paused'>('idle');
  const muted = useRef(false);
  const discarded = useRef(false);
  const hasAudio = useRef(false);
  const generation = useRef(0);

  const discardRecording = useCallback(async () => {
    generation.current += 1;
    discarded.current = true;
    if (phase.current === 'idle' || phase.current === 'preparing') return;
    phase.current = 'idle';
    try { await recorder.stop(); } catch (error) { logger.warn('통화 녹음 정리 실패', error); }
  }, [recorder]);

  const startRecording = useCallback(async ({ isCurrent = () => true, managesAudioSession = false }: { isCurrent?: () => boolean; managesAudioSession?: boolean } = {}) => {
    const attempt = ++generation.current;
    discarded.current = false;
    hasAudio.current = false;
    phase.current = 'preparing';
    try {
      const { granted } = await AudioModule.getRecordingPermissionsAsync();
      if (!granted) throw new Error('마이크 권한이 필요해요.');
      if (!isCurrent() || attempt !== generation.current) { phase.current = 'idle'; return; }
      if (Platform.OS === 'ios' && !managesAudioSession) await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      if (!isCurrent() || attempt !== generation.current) { phase.current = 'idle'; return; }
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      if (!isCurrent() || attempt !== generation.current) {
        await recorder.stop();
        phase.current = 'idle';
        return;
      }
      phase.current = 'ready';
      if (!muted.current) {
        recorder.record();
        phase.current = 'recording';
        hasAudio.current = true;
      }
    } catch (error) {
      await discardRecording();
      throw error;
    }
  }, [recorder, discardRecording]);

  const setRecordingMuted = useCallback((next: boolean) => {
    muted.current = next;
    if (discarded.current) return;
    try {
      if (next && phase.current === 'recording') {
        recorder.pause();
        phase.current = 'paused';
      } else if (!next && (phase.current === 'paused' || phase.current === 'ready')) {
        recorder.record();
        phase.current = 'recording';
        hasAudio.current = true;
      }
    } catch (error) {
      // Fail closed: never upload a file that may contain speech recorded while muted.
      void discardRecording();
      throw error;
    }
  }, [recorder, discardRecording]);

  const stopAndUpload = useCallback(async (owner: string): Promise<string> => {
    generation.current += 1;
    if (phase.current === 'idle' || phase.current === 'preparing') return '';
    phase.current = 'idle';
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri || discarded.current || !hasAudio.current) return '';
      const currentMember = () => {
        const session = useAuthStore.getState();
        if (!owner || !session.isLoggedIn || session.userUuid !== owner) throw new Error('통화 계정이 변경됐어요.');
      };
      currentMember();
      // HIGH_QUALITY is MPEG4 AAC (.m4a) on both mobile platforms.
      const contentType = 'audio/mp4';
      const response = await getPresignedUrl({ fileName: 'call-recording.m4a', contentType, directory: 'interviews' });
      currentMember();
      await uploadFileToS3(response.result.presignedUrl, uri, contentType);
      return response.result.fileUrl;
    } catch (error) {
      logger.error('통화 녹음 저장 실패', error);
      return '';
    }
  }, [recorder]);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; queueMicrotask(() => { if (!mounted.current) void discardRecording(); }); };
  }, [discardRecording]);
  return { startRecording, stopAndUpload, setRecordingMuted, discardRecording };
}
