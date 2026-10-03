import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useSTT } from '@/src/hooks/useSTT';
import { useInterviewSpeech } from './useInterviewSpeech';
import { useInterviewUpload } from './useInterviewUpload';

export type InterviewPhase = 'ready' | 'starting' | 'recording' | 'stopping' | 'review' | 'saving';
type Target = { userUuid: string; questionId: number; generation: number };
type Capture = Target & { recordingId: string };
type Draft = Capture & { uri: string; transcript: string; durationMs: number; notice: string | null };
export function useInterviewFlow(questionId: number | undefined, onSaved: () => Promise<void>) {
  const speech = useInterviewSpeech();
  const stt = useSTT('ko-KR');
  const upload = useInterviewUpload();
  const { startRecording, stopRecording } = speech;
  const { startListening, stopListening, resetTranscript, getRecognitionIssue } = stt;
  const [phase, setPhase] = useState<InterviewPhase>('ready');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsLoginCheck, setNeedsLoginCheck] = useState(false);
  const needsLogin = useRef(false);
  const phaseRef = useRef<InterviewPhase>('ready');
  const draftRef = useRef<Draft | null>(null);
  const capture = useRef<Capture | null>(null);
  const generation = useRef(0);
  const currentQuestion = useRef(questionId);
  currentQuestion.current = questionId;
  const latestTranscript = useRef(stt.transcript);
  latestTranscript.current = stt.transcript;
  const lock = useRef(false);
  const mounted = useRef(true);
  const focused = useRef(true);
  const pendingAdvance = useRef<Target | null>(null);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;
  const transition = useCallback((next: InterviewPhase) => { phaseRef.current = next; if (mounted.current) setPhase(next); }, []);
  const updateDraft = useCallback((next: Draft | null) => { draftRef.current = next; if (mounted.current) setDraft(next); }, []);
  const isCurrent = useCallback((target: Target) => {
    const user = useAuthStore.getState();
    return mounted.current && generation.current === target.generation && user.isLoggedIn && user.userUuid === target.userUuid && currentQuestion.current === target.questionId;
  }, []);
  const invalidateSession = useCallback(() => {
    const shouldStop = phaseRef.current === 'recording';
    generation.current += 1;
    lock.current = false;
    capture.current = null;
    pendingAdvance.current = null;
    needsLogin.current = true;
    updateDraft(null);
    transition('ready');
    if (mounted.current) {
      setNeedsLoginCheck(true);
      setError('로그인 상태가 바뀌었어요. 로그인으로 가입 진행 상태를 다시 확인해주세요.');
    }
    if (shouldStop) void Promise.allSettled([stopListening(), stopRecording()]);
    resetTranscript();
  }, [resetTranscript, stopListening, stopRecording, transition, updateDraft]);
  const discardStale = useCallback((target: Target) => {
    if (mounted.current && generation.current === target.generation) invalidateSession();
  }, [invalidateSession]);
  useEffect(() => {
    let session = useAuthStore.getState();
    return useAuthStore.subscribe(next => {
      const changed = next.isLoggedIn !== session.isLoggedIn || next.userUuid !== session.userUuid;
      session = next;
      if (changed) invalidateSession();
    });
  }, [invalidateSession]);

  const finishRecording = useCallback(async (notice?: string) => {
    if (lock.current || phaseRef.current !== 'recording' || !capture.current) return;
    lock.current = true;
    transition('stopping');
    const target = capture.current;
    try {
      // Both operations must settle even if one fails. Audio does not continue during STT finalization.
      const [textResult, audioResult] = await Promise.allSettled([stopListening(), stopRecording()]);
      if (!isCurrent(target)) { discardStale(target); return; }
      if (audioResult.status !== 'fulfilled' || !audioResult.value.uri) throw new Error('녹음을 마무리하지 못했어요. 다시 녹음해주세요.');
      const answerText = textResult.status === 'fulfilled' ? textResult.value : latestTranscript.current;
      updateDraft({
        ...target, uri: audioResult.value.uri, durationMs: audioResult.value.durationMs,
        transcript: answerText.trim(),
        notice: notice || getRecognitionIssue() || (textResult.status === 'rejected' ? '일부 말을 인식하지 못했어요. 내용을 확인해주세요.' : null),
      });
      transition('review');
    } catch (failure) {
      if (isCurrent(target)) {
        setError(getErrorDisplayMessage(failure, '녹음을 마무리하지 못했어요. 다시 녹음해주세요.'));
        transition(draftRef.current ? 'review' : 'ready');
      } else discardStale(target);
    } finally { if (generation.current === target.generation) lock.current = false; }
  }, [discardStale, getRecognitionIssue, isCurrent, stopListening, stopRecording, transition, updateDraft]);

  const beginRecording = useCallback(async () => {
    const user = useAuthStore.getState();
    if (lock.current || needsLogin.current || !focused.current || !questionId || !user.userUuid || !user.isLoggedIn || !['ready', 'review'].includes(phaseRef.current)) return;
    lock.current = true;
    transition('starting');
    setError(null);
    setNeedsLoginCheck(false);
    const target = { userUuid: user.userUuid, questionId, recordingId: '', generation: generation.current };
    let audioStarted = false;
    try {
      target.recordingId = randomUUID();
      await startRecording();
      audioStarted = true;
      if (!isCurrent(target)) throw new Error('로그인 상태가 바뀌었어요.');
      await startListening();
      if (!isCurrent(target) || !focused.current || AppState.currentState !== 'active') throw new Error('녹음이 중단됐어요. 화면으로 돌아와 다시 녹음해주세요.');
      capture.current = target;
      transition('recording');
    } catch (failure) {
      if (audioStarted) await Promise.allSettled([stopListening(), stopRecording()]);
      if (isCurrent(target)) {
        setError(getErrorDisplayMessage(failure, '녹음을 시작하지 못했어요. 잠시 후 다시 눌러주세요.'));
        transition(draftRef.current ? 'review' : 'ready');
      } else discardStale(target);
    } finally { if (generation.current === target.generation) lock.current = false; }
  }, [discardStale, isCurrent, questionId, startListening, startRecording, stopListening, stopRecording, transition]);

  const saveAnswer = async () => {
    const answer = draftRef.current;
    if (lock.current || needsLogin.current || phaseRef.current !== 'review' || !answer?.transcript.trim() || !isCurrent(answer)) return;
    lock.current = true;
    transition('saving');
    setError(null);
    let confirmed = false;
    try {
      const success = await upload.saveAnswer({ ...answer, answerText: answer.transcript });
      if (!isCurrent(answer)) { discardStale(answer); return; }
      if (!success) { transition('review'); return; }
      confirmed = true;
      updateDraft(null);
      capture.current = null;
      resetTranscript();
      transition('ready');
      if (focused.current) await onSaved();
      else pendingAdvance.current = { userUuid: answer.userUuid, questionId: answer.questionId, generation: answer.generation };
    } catch (failure) {
      if (isCurrent(answer)) {
        const forbidden = confirmed || getErrorCode(failure) === 'FORBIDDEN';
        needsLogin.current = forbidden;
        setNeedsLoginCheck(forbidden);
        setError(forbidden
          ? confirmed ? '답변은 저장됐어요. 다음 단계로 이동하지 못했으니 로그인으로 진행 상태를 확인해주세요.' : '가입 진행 상태를 다시 확인해야 해요. 마지막 답변이 이미 저장됐을 수도 있어요. 로그인으로 진행 상태를 확인해주세요.'
          : getErrorDisplayMessage(failure, '저장을 마치지 못했어요. 답변은 그대로 있으니 다시 저장해주세요.'));
        transition(confirmed ? 'ready' : 'review');
      } else discardStale(answer);
    } finally { if (generation.current === answer.generation) lock.current = false; }
  };
  const changeText = (text: string) => {
    if (phaseRef.current === 'review' && draftRef.current) updateDraft({ ...draftRef.current, transcript: text });
  };
  useEffect(() => {
    if (phase === 'recording' && (stt.recognitionEnded || speech.recordingError)) {
      void finishRecording(speech.recordingError || '음성 인식이 먼저 끝났어요. 빠진 내용이 없는지 확인해주세요.');
    }
  }, [finishRecording, phase, speech.recordingError, stt.recognitionEnded]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      if (next !== 'active') void finishRecording('앱을 벗어나거나 다른 소리가 재생되어 녹음을 마쳤어요. 답변을 확인해주세요.');
    });
    return () => subscription.remove();
  }, [finishRecording]);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    const saved = pendingAdvance.current;
    if (saved && isCurrent(saved)) {
      pendingAdvance.current = null;
      lock.current = true;
      void onSavedRef.current().catch(() => {
        if (!isCurrent(saved)) return;
        needsLogin.current = true;
        setNeedsLoginCheck(true);
        setError('답변은 저장됐어요. 다음 단계로 이동하지 못했으니 로그인으로 진행 상태를 확인해주세요.');
      }).finally(() => { if (generation.current === saved.generation) lock.current = false; });
    }
    return () => { focused.current = false; void finishRecording('화면을 벗어나 녹음을 마쳤어요. 답변을 확인해주세요.'); };
  }, [finishRecording, isCurrent]));
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      if (phaseRef.current === 'recording') void Promise.allSettled([stopListening(), stopRecording()]);
    };
  }, [stopListening, stopRecording]);
  return {
    phase, draft, error, needsLoginCheck, beginRecording, finishRecording, saveAnswer, changeText,
    isBusy: ['starting', 'stopping', 'saving'].includes(phase),
    isListening: stt.isListening, transcript: stt.transcript, durationMs: speech.durationMs, metering: speech.metering,
    hasPermission: speech.hasPermission, canAskAgain: speech.canAskAgain, requestPermission: speech.requestPermission,
    saveStage: upload.stage, uploadProgress: upload.uploadProgress,
  };
}
