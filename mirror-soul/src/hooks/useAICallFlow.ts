import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, PermissionsAndroid, Platform } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { AudioModule, setAudioModeAsync } from 'expo-audio';
import { useAuthStore } from '../store/useAuthStore';
import { initiateCall, setCallInProgress, endCall } from '../services/callService';
import { useRemoteAudioVolume } from '@/src/features/voice-audio/hooks/useRemoteAudioVolume';
import { useWebRTCCall } from './useWebRTCCall';
import { useCallRecording } from './useCallRecording';
import { logger } from '../utils/logger';
import { queryClient } from '../services/queryClient';
import { getErrorCode, getErrorDisplayMessage } from '../utils/apiErrorCode';
import type { SignalingMessage, OfferData, AnswerData, IceData, CallRejectData } from '../types/signaling';
import type { CallMediaType, EndCallResult } from '../types/api/call';

export type CallStatus = 'idle' | 'initiating' | 'joining' | 'inviting' | 'connecting' | 'connected' | 'reconnecting' | 'ending' | 'ended';
export type CompletedCall = EndCallResult;
export type CallErrorKind = 'microphone' | 'connection' | 'unavailable' | 'end';
type Issue = { message: string; kind: CallErrorKind };
type Session = { callId: number; roomId: string; callerSignalId: string; aiSignalId: string; mediaType: CallMediaType; owner: string };

const rejectionMessage = (reason?: string) => reason === 'CLONE_NOT_READY'
  ? '이 트윈은 아직 통화 준비 중이에요. 잠시 후 다시 확인해주세요.'
  : reason === 'AI_SERVER_UNAVAILABLE' || reason === 'CALL_CONTEXT_UNAVAILABLE' || reason === 'AI_SERVER_CONFIG_ERROR'
    ? '지금은 트윈에 연결할 수 없어요. 잠시 후 다시 시도해주세요.'
    : '트윈의 통화 정보를 확인하지 못했어요. 다시 시도해주세요.';

/** Keeps transport, recording and server finalization separate. No invented AI speaking state. */
export function useAICallFlow(targetUserUuid?: string) {
  const { userUuid } = useAuthStore();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [issue, setIssueState] = useState<Issue | null>(null);
  const issueRef = useRef<Issue | null>(null);
  const setIssue = useCallback((next: Issue | null) => { issueRef.current = next; if (mounted.current) setIssueState(next); }, []);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraPending, setIsCameraPending] = useState(false);
  const [setupPending, setSetupPending] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [completedCall, setCompletedCall] = useState<CompletedCall | null>(null);
  const mounted = useRef(true);
  const status = useRef<CallStatus>('idle');
  const session = useRef<Session | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const attempt = useRef(0);
  const starting = useRef(false);
  const closing = useRef(false);
  const finishPromise = useRef<Promise<void> | null>(null);
  const connectedAt = useRef<number | null>(null);
  const recordingUrl = useRef<string | undefined>(undefined);
  const speaker = useRef(false);
  const muted = useRef(false);
  const cameraOn = useRef(false);
  const cameraRequest = useRef(0);
  const cameraBusy = useRef(false);
  const stageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishRef = useRef<(issue?: Issue) => Promise<void>>(async () => {});
  const failRef = useRef<(message: string, kind?: CallErrorKind) => Promise<void>>(async () => {});
  const owner = useRef(userUuid);

  const rtc = useWebRTCCall();
  const { remoteStream, localCameraStream, iceConnectionState, onLocalIceCandidateCb, initialize, createOffer, createAnswer, applyAnswer, applyOffer, applyIceCandidate, close: closeRTC, enableCamera, disableCamera, setMicrophoneMuted } = rtc;
  useRemoteAudioVolume(remoteStream);
  const { startRecording, stopAndUpload, setRecordingMuted, discardRecording } = useCallRecording();

  const transition = useCallback((next: CallStatus) => {
    status.current = next;
    if (mounted.current) setCallStatus(next);
  }, []);
  const clearStage = useCallback(() => {
    if (stageTimer.current) clearTimeout(stageTimer.current);
    stageTimer.current = null;
  }, []);
  const send = useCallback((message: SignalingMessage) => {
    if (ws.current?.readyState !== WebSocket.OPEN) return;
    try { ws.current.send(JSON.stringify(message)); }
    catch (error) { logger.warn('통화 신호 전송 실패', error); }
  }, []);
  const closeTransport = useCallback(() => {
    attempt.current += 1;
    cameraRequest.current += 1;
    clearStage();
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    reconnectTimer.current = null;
    const socket = ws.current;
    ws.current = null;
    if (socket) {
      socket.onopen = null; socket.onmessage = null; socket.onerror = null; socket.onclose = null;
      try { socket.close(); } catch { /* Socket may already be closed. */ }
    }
    try { closeRTC(); } catch (error) { logger.warn('미디어 연결 정리 실패', error); }
    try { InCallManager.stop(); } catch (error) { logger.warn('통화 소리 정리 실패', error); }
    speaker.current = false; muted.current = false; cameraOn.current = false; cameraBusy.current = false;
    if (mounted.current) { setIsSpeakerOn(false); setIsCameraOn(false); setIsCameraPending(false); }
  }, [clearStage, closeRTC]);

  const finish = useCallback((failure?: Issue): Promise<void> => {
    if (finishPromise.current) return finishPromise.current;
    closing.current = true;
    if (failure && mounted.current) setIssue(failure);
    transition('ending');
    const active = session.current;
    const wasConnected = connectedAt.current != null;
    if (active) send({ type: 'CALL_END', roomId: active.roomId, from: active.callerSignalId, to: active.aiSignalId, data: { callId: active.callId } });
    // Stop transmission and camera immediately, before any file upload or REST wait.
    closeTransport();
    const task = (async () => {
      if (!active) { await discardRecording(); return; }
      if (recordingUrl.current === undefined) recordingUrl.current = await stopAndUpload(active.owner);
      try {
        const response = await endCall(active.callId, recordingUrl.current ?? '');
        if (!response.isSuccess) throw new Error(response.message);
        session.current = null;
        if (mounted.current) {
          if (!failure) setIssue(null);
          if (wasConnected && response.result.status === 'COMPLETED') setCompletedCall(response.result);
        }
        void queryClient.invalidateQueries({ queryKey: ['profile', 'time'] });
        void queryClient.invalidateQueries({ queryKey: ['history', 'calls'] });
      } catch (error) {
        if (getErrorCode(error) === 'CALL_ALREADY_ENDED') {
          session.current = null;
          if (mounted.current) setIssue({ kind: 'end', message: '통화는 종료됐어요. 사용 시간과 남은 시간은 기록과 프로필에서 다시 확인해주세요.' });
        } else if (mounted.current) {
          setIssue({ kind: 'end', message: '소리와 영상은 껐지만 종료 처리를 확인하지 못했어요. 종료 확인을 다시 시도해주세요.' });
        }
        logger.error('통화 종료 확인 실패', error);
      }
    })().finally(() => {
      closing.current = false;
      finishPromise.current = null;
      transition('ended');
    });
    finishPromise.current = task;
    return task;
  }, [closeTransport, discardRecording, send, setIssue, stopAndUpload, transition]);
  finishRef.current = finish;
  const fail = useCallback((message: string, kind: CallErrorKind = 'connection') => finishRef.current({ message, kind }), []);
  failRef.current = fail;
  const armStage = useCallback((milliseconds: number, message: string) => {
    clearStage();
    stageTimer.current = setTimeout(() => { void failRef.current(message); }, milliseconds);
  }, [clearStage]);

  const handleMessage = useCallback(async (event: WebSocketMessageEvent) => {
    if (closing.current) return;
    let message: SignalingMessage;
    try { message = JSON.parse(event.data as string); } catch { return; }
    const active = session.current;
    if (!active || !message || typeof message.type !== 'string') return;
    if (message.roomId && message.roomId !== active.roomId) return;
    if (message.data && typeof message.data === 'object' && 'callId' in message.data && message.data.callId !== active.callId) return;
    try {
      switch (message.type) {
        case 'JOINED':
          if (status.current !== 'joining') return;
          transition('inviting');
          send({ type: 'CALL_INVITE', roomId: active.roomId, from: active.callerSignalId, to: active.aiSignalId, data: { callId: active.callId } });
          armStage(15000, '트윈의 응답을 기다리는 시간이 길어지고 있어요. 잠시 후 다시 연결해주세요.');
          break;
        case 'CALL_ACCEPT': {
          if (status.current !== 'inviting' && status.current !== 'joining') return;
          transition('connecting');
          armStage(25000, '음성과 영상 연결을 마치지 못했어요. 네트워크를 확인하고 다시 연결해주세요.');
          const offer = await createOffer();
          if (session.current !== active || closing.current) return;
          send({ type: 'OFFER', roomId: active.roomId, from: active.callerSignalId, to: active.aiSignalId, data: { callId: active.callId, sdp: { type: 'offer', sdp: offer.sdp ?? '' } } });
          break;
        }
        case 'ANSWER': await applyAnswer((message.data as AnswerData).sdp); break;
        case 'ICE': await applyIceCandidate((message.data as IceData).candidate); break;
        case 'OFFER': {
          await applyOffer((message.data as OfferData).sdp);
          const answer = await createAnswer();
          if (session.current !== active || closing.current) return;
          send({ type: 'ANSWER', roomId: active.roomId, from: active.callerSignalId, to: active.aiSignalId, data: { callId: active.callId, sdp: { type: 'answer', sdp: answer.sdp ?? '' } } });
          break;
        }
        case 'CALL_REJECT': await failRef.current(rejectionMessage((message.data as CallRejectData | null)?.reason), 'unavailable'); break;
        case 'SIGNALING_ERROR': await failRef.current('트윈과의 연결이 끊어졌어요. 다시 연결해주세요.'); break;
        case 'CALL_END': await finishRef.current(); break;
      }
    } catch (error) {
      logger.error('통화 연결 신호 처리 실패', error);
      if (session.current === active && !closing.current) await failRef.current('연결 정보를 확인하지 못했어요. 다시 연결해주세요.');
    }
  }, [applyAnswer, applyIceCandidate, applyOffer, armStage, createAnswer, createOffer, send, transition]);

  const startCall = useCallback(async () => {
    if (starting.current || closing.current || session.current || !['idle', 'ended'].includes(status.current)) return;
    if (!userUuid) { setIssue({ kind: 'connection', message: '로그인 정보를 다시 확인해주세요.' }); transition('ended'); return; }
    starting.current = true;
    setSetupPending(true);
    const request = ++attempt.current;
    setIssue(null); setNotice(null); setCompletedCall(null); setIsMuted(false);
    muted.current = false; setRecordingMuted(false);
    connectedAt.current = null; recordingUrl.current = undefined;
    setCallDurationSeconds(0);
    transition('initiating');
    const isCurrent = () => mounted.current && request === attempt.current;
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!isCurrent()) return;
      if (!permission.granted) { await failRef.current('마이크를 허용하면 트윈과 대화할 수 있어요. 휴대폰 설정에서 마이크 권한을 확인해주세요.', 'microphone'); return; }
      if (Platform.OS === 'ios') await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      if (!isCurrent()) return;
      armStage(20000, '통화 준비에 시간이 걸리고 있어요. 네트워크를 확인하고 다시 연결해주세요.');
      const [created, initialized] = await Promise.allSettled([
        initiateCall(targetUserUuid ?? userUuid, { mediaType: 'VIDEO' }), initialize(),
      ]);
      if (created.status === 'rejected') throw created.reason;
      if (!created.value.isSuccess) throw new Error(created.value.message);
      const data = created.value.result;
      const active: Session = { ...data, owner: userUuid };
      if (!isCurrent()) {
        // A canceled REST request can still create a room. Close that room exactly once.
        session.current = active;
        await finishRef.current(issueRef.current ?? undefined);
        return;
      }
      session.current = active;
      if (initialized.status === 'rejected') throw initialized.reason;
      const base = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (!base) throw new Error('서버 연결 설정을 확인해주세요.');
      const address = new URL(data.signalingUrl || '/ws/signaling', base);
      if (address.protocol === 'https:') address.protocol = 'wss:';
      if (address.protocol === 'http:') address.protocol = 'ws:';
      if (!['wss:', 'ws:'].includes(address.protocol)) throw new Error('서버 연결 주소를 확인해주세요.');
      transition('joining');
      armStage(10000, '연결을 시작하지 못했어요. 네트워크를 확인하고 다시 연결해주세요.');
      const socket = new WebSocket(address.toString());
      ws.current = socket;
      socket.onopen = () => {
        if (ws.current !== socket || closing.current) return;
        send({ type: 'JOIN', roomId: active.roomId, from: active.callerSignalId, to: 'server', data: null });
      };
      socket.onmessage = event => { if (ws.current === socket) void handleMessage(event); };
      socket.onerror = () => { if (ws.current === socket && !closing.current) void failRef.current('서버 연결에 문제가 생겼어요. 다시 연결해주세요.'); };
      socket.onclose = () => { if (ws.current === socket && !closing.current) void failRef.current('트윈과의 연결이 끊어졌어요. 다시 연결해주세요.'); };
    } catch (error) {
      if (isCurrent()) await failRef.current(getErrorDisplayMessage(error, '통화를 시작하지 못했어요. 다시 시도해주세요.'));
    } finally {
      starting.current = false;
      if (mounted.current) setSetupPending(false);
    }
  }, [armStage, handleMessage, initialize, send, setIssue, setRecordingMuted, targetUserUuid, transition, userUuid]);

  useEffect(() => {
    onLocalIceCandidateCb.current = candidate => {
      const active = session.current;
      if (active && !closing.current) send({ type: 'ICE', roomId: active.roomId, from: active.callerSignalId, to: active.aiSignalId, data: { callId: active.callId, candidate: { candidate: candidate.candidate, sdpMid: candidate.sdpMid ?? '0', sdpMLineIndex: candidate.sdpMLineIndex ?? 0 } } });
    };
    return () => { onLocalIceCandidateCb.current = null; };
  }, [onLocalIceCandidateCb, send]);

  useEffect(() => {
    const active = session.current;
    if (!active || closing.current) return;
    if (iceConnectionState === 'connected' || iceConnectionState === 'completed') {
      if (status.current === 'reconnecting') {
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
        transition('connected');
      } else if (status.current === 'connecting') {
        clearStage();
        connectedAt.current = Date.now();
        transition('connected');
        InCallManager.start({ media: 'video', auto: true });
        void (async () => {
          try { await setCallInProgress(active.callId); }
          catch (error) { logger.error('통화 연결 확인 실패', error); if (session.current === active && !closing.current) await failRef.current('서버의 통화 연결 확인을 받지 못했어요. 다시 연결해주세요.'); return; }
          if (session.current !== active || closing.current) return;
          const current = () => session.current === active && !closing.current && mounted.current;
          try { await startRecording({ isCurrent: current, managesAudioSession: true }); }
          catch (error) { logger.error('통화 녹음 준비 실패', error); if (current()) setNotice('통화는 연결됐지만 음성 기록을 준비하지 못했어요.'); }
          finally { if (current()) (InCallManager.setForceSpeakerphoneOn as (flag: boolean | null) => void)(speaker.current ? true : null); }
        })();
      }
    } else if (iceConnectionState === 'disconnected' && status.current === 'connected') {
      transition('reconnecting');
      reconnectTimer.current = setTimeout(() => { void failRef.current('연결을 복구하지 못했어요. 네트워크를 확인하고 다시 연결해주세요.'); }, 5000);
    } else if ((iceConnectionState === 'failed' || iceConnectionState === 'closed') && ['connecting', 'connected', 'reconnecting'].includes(status.current)) {
      void failRef.current('음성과 영상 연결이 끊어졌어요. 다시 연결해주세요.');
    }
  }, [clearStage, iceConnectionState, startRecording, transition]);

  useEffect(() => {
    if (!['connected', 'reconnecting'].includes(callStatus)) return;
    const tick = () => { if (connectedAt.current != null) setCallDurationSeconds(Math.max(0, Math.floor((Date.now() - connectedAt.current) / 1000))); };
    tick();
    const timer = setInterval(tick, 1000);
    const foreground = AppState.addEventListener('change', next => { if (next === 'active') tick(); });
    return () => { clearInterval(timer); foreground.remove(); };
  }, [callStatus]);

  const toggleMute = useCallback(() => {
    if (status.current !== 'connected' || closing.current) return;
    const next = !muted.current;
    try {
      if (next) { setMicrophoneMuted(true); setRecordingMuted(true); }
      else { setRecordingMuted(false); setMicrophoneMuted(false); }
      muted.current = next;
      setIsMuted(next);
    } catch (error) {
      logger.error('마이크 상태 변경 실패', error);
      void discardRecording();
      void failRef.current('마이크 설정을 확인하지 못해 통화를 마쳤어요. 다시 연결해주세요.');
    }
  }, [discardRecording, setMicrophoneMuted, setRecordingMuted]);
  const toggleSpeaker = useCallback(() => {
    if (status.current !== 'connected' || closing.current) return;
    const next = !speaker.current;
    try {
      (InCallManager.setForceSpeakerphoneOn as (flag: boolean | null) => void)(next ? true : null);
      speaker.current = next; setIsSpeakerOn(next);
    } catch { setNotice('소리 출력을 바꾸지 못했어요. 연결된 이어폰이나 기기 설정을 확인해주세요.'); }
  }, []);
  const toggleCamera = useCallback(async () => {
    if (status.current !== 'connected' || closing.current || cameraBusy.current) return;
    const request = ++cameraRequest.current;
    cameraBusy.current = true; setIsCameraPending(true);
    try {
      if (cameraOn.current) { disableCamera(); cameraOn.current = false; setIsCameraOn(false); return; }
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, { title: '내 모습 확인', message: '내 화면에서 모습을 확인할 때만 카메라를 사용해요. AI에게 전송하지 않아요.', buttonPositive: '허용', buttonNegative: '나중에' });
        if (!mounted.current || request !== cameraRequest.current) return;
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) { setNotice('내 모습을 보려면 휴대폰 설정에서 카메라를 허용해주세요.'); return; }
      }
      if (request !== cameraRequest.current || closing.current || !session.current) return;
      const enabled = await enableCamera();
      if (enabled && request === cameraRequest.current && !closing.current && session.current) { cameraOn.current = true; setIsCameraOn(true); setNotice(null); }
    } catch { if (mounted.current && request === cameraRequest.current) setNotice('카메라를 열지 못했어요. 휴대폰 설정에서 권한을 확인해주세요.'); }
    finally { if (mounted.current && request === cameraRequest.current) { cameraBusy.current = false; setIsCameraPending(false); } }
  }, [disableCamera, enableCamera]);

  useEffect(() => {
    if (owner.current !== userUuid) {
      owner.current = userUuid;
      void failRef.current('계정이 변경되어 통화를 마쳤어요.');
    }
  }, [userUuid]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; queueMicrotask(() => { if (!mounted.current) void finishRef.current(); }); };
  }, []);

  return {
    callStatus, remoteStream, localCameraStream, startCall,
    hangUp: useCallback(() => finishRef.current(), []),
    error: issue?.message ?? null, errorKind: issue?.kind ?? null,
    canRetry: !!issue && !setupPending && callStatus === 'ended' && session.current === null && issue.kind !== 'end',
    canRetryEnd: issue?.kind === 'end' && session.current !== null && session.current.owner === userUuid && callStatus === 'ended',
    isSpeakerOn, toggleSpeaker, isMuted, toggleMute, isCameraOn, isCameraPending, toggleCamera,
    callDurationSeconds, completedCall, notice,
    dismissNotice: useCallback(() => setNotice(null), []),
    openSettings: useCallback(() => { void Linking.openSettings().catch(() => setNotice('휴대폰 설정에서 Mirror Soul 권한을 확인해주세요.')); }, []),
  };
}
