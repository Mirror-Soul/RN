import { useState, useCallback, useEffect } from 'react';
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

  // ─── 이벤트 리스너 등록 ───
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
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

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

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
