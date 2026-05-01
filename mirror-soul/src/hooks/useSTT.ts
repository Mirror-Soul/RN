import { useState, useCallback, useEffect } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

type SupportedLanguage = 'ko-KR' | 'en-US';

/**
 * 실시간 음성 인식(STT)을 관리하는 공용 커스텀 훅.
 *
 * - expo-speech-recognition의 네이티브 STT 엔진을 사용합니다.
 * - 한국어(ko-KR)와 영어(en-US)를 지원합니다.
 * - interimResults로 중간 결과를 실시간 표시하고, 녹음 중지 시 최종 결과를 확정합니다.
 */
export function useSTT(lang: SupportedLanguage = 'ko-KR') {
  const [finalizedTranscript, setFinalizedTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  // ─── 이벤트 리스너 등록 ───
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    // 가장 신뢰도 높은 결과(0번 인덱스)를 사용
    const latestResult = event.results[0]?.transcript ?? '';

    if (event.isFinal) {
      // 문장이 확정된 경우 finalizedTranscript에 추가하고 interim을 비움
      setFinalizedTranscript((prev) => {
        const separator = prev.length > 0 ? ' ' : '';
        return prev + separator + latestResult;
      });
      setInterimTranscript('');
    } else {
      // 인식 중인 상태면 interimTranscript만 업데이트
      setInterimTranscript(latestResult);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('STT 오류:', event.error, event.message);
    setIsListening(false);
  });

  // ─── 음성 인식 시작 ───
  const startListening = useCallback(async () => {
    setFinalizedTranscript(''); // 이전 텍스트 초기화
    setInterimTranscript('');

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

  // ─── 언마운트 시 컴포넌트 정리 (Cleanup) ───
  useEffect(() => {
    return () => {
      // 컴포넌트가 사라질 때 엔진 강제 중단 및 리소스 반환
      try {
        ExpoSpeechRecognitionModule.abort?.();
        ExpoSpeechRecognitionModule.stop?.();
      } catch (error) {
        // 이미 중지되었을 경우의 오류 무시
      }
    };
  }, []);

  // ─── 초기화 ───
  const resetTranscript = useCallback(() => {
    setFinalizedTranscript('');
    setInterimTranscript('');
  }, []);

  // 두 상태를 합쳐서 최종 텍스트 노출
  const transcript = (
    finalizedTranscript + (interimTranscript ? ' ' + interimTranscript : '')
  ).trim();

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  };
}
