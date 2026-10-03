import { useCallback, useEffect, useRef, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

type SupportedLanguage = 'ko-KR' | 'en-US';
const STOP_TIMEOUT_MS = 2500;

const recognitionMessages: Record<string, string> = {
  'no-speech': '말소리를 충분히 인식하지 못했어요. 조용한 곳에서 다시 녹음해보세요.',
  'speech-timeout': '말소리를 충분히 인식하지 못했어요. 조용한 곳에서 다시 녹음해보세요.',
  network: '음성 인식 연결이 끊겼어요. 다르게 적힌 부분이나 빠진 내용이 있는지 확인해주세요.',
  interrupted: '녹음 중 다른 소리가 재생되거나 통화가 연결됐어요. 답변을 확인해주세요.',
  'audio-capture': '마이크 소리를 인식하지 못했어요. 다시 녹음해주세요.',
  'not-allowed': '마이크와 음성 인식 권한을 확인해주세요.',
};

/** Latest text lives in refs so final result + end in one native event batch cannot lose words. */
export function useSTT(lang: SupportedLanguage = 'ko-KR') {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionIssue, setRecognitionIssue] = useState<string | null>(null);
  const [recognitionEnded, setRecognitionEnded] = useState(false);
  const text = useRef({ final: '', interim: '' });
  const active = useRef(false);
  const starting = useRef(false);
  const issue = useRef<string | null>(null);
  const mounted = useRef(true);
  const pending = useRef<Promise<string> | null>(null);
  const resolver = useRef<(() => void) | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readText = useCallback(() => [text.current.final, text.current.interim].filter(Boolean).join(' ').trim(), []);
  const reportIssue = useCallback((message: string | null) => {
    issue.current = message;
    if (mounted.current) setRecognitionIssue(message);
  }, []);
  const settle = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    resolver.current?.();
    resolver.current = null;
    pending.current = null;
  }, []);
  const abortRecognition = useCallback((message: string) => {
    active.current = false;
    if (mounted.current) {
      setIsListening(false);
      setRecognitionEnded(true);
      reportIssue(message);
    }
    try { ExpoSpeechRecognitionModule.abort(); }
    catch { /* The native recognizer may already have stopped. */ }
    finally { settle(); }
  }, [reportIssue, settle]);

  useSpeechRecognitionEvent('start', () => {
    if (active.current && mounted.current) setIsListening(true);
  });
  useSpeechRecognitionEvent('result', event => {
    if (!active.current || !mounted.current) return;
    const next = event.results[0]?.transcript.trim() ?? '';
    if (event.isFinal) {
      text.current.final = [text.current.final, next].filter(Boolean).join(' ');
      text.current.interim = '';
    } else {
      text.current.interim = next;
    }
    setTranscript(readText());
  });
  useSpeechRecognitionEvent('nomatch', () => {
    if (active.current && mounted.current) reportIssue(recognitionMessages['no-speech']);
  });
  useSpeechRecognitionEvent('error', event => {
    if (!active.current || !mounted.current || event.error === 'aborted') return;
    reportIssue(recognitionMessages[event.error] || '일부 말을 인식하지 못했어요. 빠진 내용이 없는지 확인해주세요.');
    // Wait for end; starting another native session on error alone can mix late events.
    setIsListening(false);
  });
  useSpeechRecognitionEvent('end', () => {
    if (!active.current) return;
    active.current = false;
    if (mounted.current) {
      setIsListening(false);
      setRecognitionEnded(true);
      setTranscript(readText());
    }
    settle();
  });

  const startListening = useCallback(async () => {
    if (starting.current || active.current || pending.current) throw new Error('이전 답변을 정리하고 있어요. 잠시 후 다시 눌러주세요.');
    starting.current = true;
    try {
      // A timed-out stop may still be running natively. Do not accept its late results as a new answer.
      if (await ExpoSpeechRecognitionModule.getStateAsync() !== 'inactive') {
        throw new Error('음성 인식을 정리하고 있어요. 잠시 후 다시 녹음해주세요.');
      }
      if (!mounted.current) throw new Error('녹음 화면을 벗어났어요.');
      text.current = { final: '', interim: '' };
      setTranscript('');
      reportIssue(null);
      setRecognitionEnded(false);
      active.current = true;
      ExpoSpeechRecognitionModule.start({ lang, interimResults: true, continuous: true });
    } catch (error) {
      active.current = false;
      throw error;
    } finally { starting.current = false; }
  }, [lang, reportIssue]);

  const stopListening = useCallback((): Promise<string> => {
    if (pending.current) return pending.current;
    if (!active.current) return Promise.resolve(readText());
    // Allocate the resolver before stop() so a synchronous end event is also handled.
    const promise = new Promise<string>(resolve => { resolver.current = () => resolve(readText()); });
    pending.current = promise;
    timeout.current = setTimeout(() => {
      abortRecognition('답변의 끝부분을 인식하지 못했을 수 있어요. 내용을 확인해주세요.');
    }, STOP_TIMEOUT_MS);
    try { ExpoSpeechRecognitionModule.stop(); }
    catch {
      abortRecognition('음성 인식을 마무리하지 못했어요. 내용을 확인해주세요.');
    }
    return promise;
  }, [abortRecognition, readText]);

  const resetTranscript = useCallback(() => {
    if (active.current) return;
    text.current = { final: '', interim: '' };
    setTranscript('');
    reportIssue(null);
    setRecognitionEnded(false);
  }, [reportIssue]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (active.current) {
        active.current = false;
        try { ExpoSpeechRecognitionModule.abort(); } catch { /* Native recorder may already be released. */ }
      }
      settle();
    };
  }, [settle]);

  const getRecognitionIssue = useCallback(() => issue.current, []);
  return { transcript, isListening, recognitionIssue, recognitionEnded, getRecognitionIssue, startListening, stopListening, resetTranscript };
}
