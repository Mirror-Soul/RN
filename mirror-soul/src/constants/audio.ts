/**
 * 인터뷰 녹음 프리셋 상수.
 *
 * AI 학습용으로 음성 톤, 음질, 음향 등 모든 특성을 보존해야 하므로
 * 무손실 Linear PCM (WAV) 포맷을 사용합니다.
 *
 * - iOS: IOSOutputFormat.LINEARPCM → .wav 출력
 * - Android: outputFormat 'default' + audioEncoder 'default' → PCM 출력
 * - sampleRate: 44100 Hz (CD 품질)
 * - numberOfChannels: 1 (모노, 음성 인식 최적화)
 * - bitDepth: 16-bit
 */
import { RecordingPresets, IOSOutputFormat, AudioQuality } from 'expo-audio';
import type { RecordingOptions } from 'expo-audio';

export const INTERVIEW_RECORDING_PRESET: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  extension: '.wav',
  sampleRate: 44100,
  numberOfChannels: 1, // 모노 (음성 녹음에 최적, 파일 크기 절반)
  bitRate: 705600, // 44100 * 16 * 1 (무손실)
  android: {
    outputFormat: 'default' as const,
    audioEncoder: 'default' as const,
    sampleRate: 44100,
  },
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};
