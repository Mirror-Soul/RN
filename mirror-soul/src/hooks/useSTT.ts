import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

type SupportedLanguage = 'ko-KR' | 'en-US';

/**
 * 실시간 음성 인식(STT)을 관리하는 공용 커스텀 훅.
 */
export function useSTT(lang: SupportedLanguage = 'ko-KR') {
  const [finalizedTranscript, setFinalizedTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  const stopResolverRef = useRef<((value: string) => void) | null>(null);

  // ─── 이벤트 리스너 등록 ───
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    // 종료 시점에 대기 중인 Promise가 있다면 현재 transcript와 함께 resolve
    if (stopResolverRef.current) {
      const finalResult = (finalizedTranscript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
      stopResolverRef.current(finalResult);
      stopResolverRef.current = null;
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    const latestResult = event.results[0]?.transcript ?? '';

    if (event.isFinal) {
      setFinalizedTranscript((prev) => {
        const separator = prev.length > 0 ? ' ' : '';
        return prev + separator + latestResult;
      });
      setInterimTranscript('');
    } else {
      setInterimTranscript(latestResult);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'no-speech') {
      console.warn('STT 정보: 음성이 감지되지 않았습니다.');
    } else {
      console.error('STT 오류:', event.error, event.message);
    }
    setIsListening(false);
    
    // 에러 발생 시에도 대기 중인 Promise가 있다면 현재까지의 결과로 resolve
    if (stopResolverRef.current) {
      const currentResult = (finalizedTranscript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
      stopResolverRef.current(currentResult);
      stopResolverRef.current = null;
    }
  });

  const startListening = useCallback(async () => {
    setFinalizedTranscript('');
    setInterimTranscript('');

    await ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true,
      continuous: true,
    });
  }, [lang]);

  const stopListening = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      // 이미 리스닝 중이 아니면 현재 결과 즉시 반환
      if (!isListening && !stopResolverRef.current) {
        resolve((finalizedTranscript + (interimTranscript ? ' ' + interimTranscript : '')).trim());
        return;
      }

      // resolver 등록
      stopResolverRef.current = (value: string) => {
        clearTimeout(timeout);
        resolve(value);
      };
      
      // 타임아웃 안전장치 (2초)
      const timeout = setTimeout(() => {
        if (stopResolverRef.current) {
          const currentResult = (finalizedTranscript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
          stopResolverRef.current(currentResult);
          stopResolverRef.current = null;
        }
      }, 2000);

      ExpoSpeechRecognitionModule.stop();
    });
  }, [isListening, finalizedTranscript, interimTranscript]);

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.abort?.();
        ExpoSpeechRecognitionModule.stop?.();
      } catch (error) {
        // ignore
      }
    };
  }, []);

  const resetTranscript = useCallback(() => {
    setFinalizedTranscript('');
    setInterimTranscript('');
  }, []);

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
