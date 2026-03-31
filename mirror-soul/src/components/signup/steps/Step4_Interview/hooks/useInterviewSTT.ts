import { useState, useCallback } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

type SupportedLanguage = 'ko-KR' | 'en-US';

/**
 * 실시간 음성 인식(STT)을 관리하는 커스텀 훅.
 *
 * - expo-speech-recognition의 네이티브 STT 엔진을 사용합니다.
 * - 한국어(ko-KR)와 영어(en-US)를 지원합니다.
 * - interimResults로 중간 결과를 실시간 표시하고,
 *   녹음 중지 시 최종 결과를 확정합니다.
 * - useInterviewSpeech(녹음)와 독립적으로 동작하여 관심사를 분리합니다.
 */
export function useInterviewSTT(lang: SupportedLanguage = 'ko-KR') {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  // ─── 이벤트 리스너 등록 ───
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    // 가장 최근 인식 결과를 transcript에 반영
    const latestResult = event.results[0]?.transcript ?? '';
    setTranscript(latestResult);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('STT 오류:', event.error, event.message);
    setIsListening(false);
  });

  // ─── 음성 인식 시작 ───
  const startListening = useCallback(async () => {
    setTranscript(''); // 이전 텍스트 초기화

    ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true, // 중간 결과 실시간 표시
      continuous: true, // 사용자가 중지할 때까지 계속 인식
    });
  }, [lang]);

  // ─── 음성 인식 중지 ───
  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  // ─── 언어 전환 시 텍스트 초기화 ───
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  };
}
