import { useCallback, useEffect, useRef, useState } from 'react';
import InCallManager from 'react-native-incall-manager';
import type { MediaStream } from 'react-native-webrtc';
import { AudioModule, setAudioModeAsync } from 'expo-audio';
import { useAuthStore } from '../store/useAuthStore';
import { initiateCall, setCallInProgress, endCall } from '../services/callService';
import { useWebRTCCall } from './useWebRTCCall';
import { useCallRecording } from './useCallRecording';
import { logger } from '../utils/logger';
import type { SignalingMessage, AnswerData, IceData, OfferData, CallRejectData, SignalingErrorData } from '../types/signaling';

const WS_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://');
const INVITE_TIMEOUT_MS = 10000; // 10초 AI 응답 대기

export type CallStatus =
  | 'idle'        // 대기
  | 'initiating'  // REST API 호출 중
  | 'joining'     // WebSocket 연결 중
  | 'inviting'    // CALL_INVITE 발송 후 AI 응답 대기
  | 'connecting'  // WebRTC Offer/Answer/ICE 교환 중
  | 'connected'   // 통화 중
  | 'ending'      // 종료 처리 중 (녹음 업로드)
  | 'ended';      // 종료 완료

/**
 * AI 트윈 음성 통화 전체 시나리오 오케스트레이션 훅 (SoC)
 *
 * 외부로 노출되는 인터페이스:
 * - callStatus: 현재 통화 단계
 * - remoteStream: AI 트윈 음성 스트림
 * - startCall(): 통화 시작
 * - hangUp(): 통화 종료
 * - error: 에러 메시지
 */
export function useAICallFlow() {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  // 기본값 스피커 on — 화면을 보며 통화하는 영상통화 UX(한뼘통화)에 맞춘다.
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const { userUuid } = useAuthStore();

  // 세션 정보 (REST API 응답으로 채워짐)
  const callSessionRef = useRef<{
    callId: number;
    roomId: string;
    callerSignalId: string;
    aiSignalId: string;
  } | null>(null);

  // WebSocket 단일 인스턴스 (Ref로 관리하여 re-render 시 중복 생성 방지)
  const wsRef = useRef<WebSocket | null>(null);

  // AI 응답 대기 타임아웃
  const inviteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 종료 진행 중 여부 (중복 방지)
  const isHangingUpRef = useRef<boolean>(false);

  // startCall 시도 식별자 — REST/WebRTC 병렬 초기화가 진행되는 동안 사용자가 취소하거나
  // 화면이 언마운트되면(_cleanup이 이 값을 증가시켜 무효화) 그 시도가 뒤늦게 완료되더라도
  // 로컬 연결을 이어가지 않고 서버에 생성된 방을 보상 종료하도록 구분하는 데 쓴다.
  const startAttemptIdRef = useRef(0);

  const {
    remoteStream,
    iceConnectionState,
    onLocalIceCandidateCb,
    initialize: initWebRTC,
    createOffer,
    createAnswer,
    applyAnswer,
    applyOffer,
    applyIceCandidate,
    close: closeWebRTC,
  } = useWebRTCCall();

  const { startRecording, stopAndUpload } = useCallRecording();

  // ─────────────────────────────────────────────
  // WebSocket 메시지 발송 헬퍼
  // ─────────────────────────────────────────────
  const sendMessage = useCallback((msg: SignalingMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      logger.warn('[useAICallFlow] WebSocket not open, cannot send message:', msg.type);
      return;
    }
    ws.send(JSON.stringify(msg));
    logger.debug('[useAICallFlow] Sent:', msg.type);
  }, []);

  // ─────────────────────────────────────────────
  // WebRTC ICE → WebSocket 전달 (로컬 ICE 발생 시)
  // ─────────────────────────────────────────────
  useEffect(() => {
    onLocalIceCandidateCb.current = (candidate: any) => {
      const session = callSessionRef.current;
      if (!session) return;

      sendMessage({
        type: 'ICE',
        roomId: session.roomId,
        from: session.callerSignalId,
        to: session.aiSignalId,
        data: {
          callId: session.callId,
          candidate: {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid ?? '0',
            sdpMLineIndex: candidate.sdpMLineIndex ?? 0,
          },
        },
      });
    };
  }, [sendMessage]);

  // ─────────────────────────────────────────────
  // WebRTC 연결 성공 감지 → setCallInProgress
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (iceConnectionState === 'connected' && callStatus === 'connecting') {
      const session = callSessionRef.current;
      if (!session) return;

      logger.info('[useAICallFlow] WebRTC connected! Notifying server...');
      setCallStatus('connected');

      // InCallManager가 이 시점부터 오디오 라우팅(스피커/이어피스)과 마이크 뮤트를 관장한다.
      // media: 'audio'로 시작하되, 기본값을 스피커 on으로 강제한다(한뼘통화 UX).
      InCallManager.start({ media: 'audio', auto: false });
      InCallManager.setSpeakerphoneOn(isSpeakerOn);

      setCallInProgress(session.callId).catch((err) => {
        logger.error('[useAICallFlow] setCallInProgress failed:', err);
      });

      startRecording().catch((err) => {
        logger.error('[useAICallFlow] startRecording failed:', err);
      });
    }
  }, [iceConnectionState, callStatus, startRecording, isSpeakerOn]);

  // ─────────────────────────────────────────────
  // 스피커/음소거 토글 (공개 API)
  // ─────────────────────────────────────────────
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => {
      const next = !prev;
      InCallManager.setSpeakerphoneOn(next);
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      InCallManager.setMicrophoneMute(next);
      return next;
    });
  }, []);

  // ─────────────────────────────────────────────
  // WebSocket 메시지 처리
  // ─────────────────────────────────────────────
  const handleMessage = useCallback(async (event: WebSocketMessageEvent) => {
    let msg: SignalingMessage;
    try {
      msg = JSON.parse(event.data as string);
    } catch {
      logger.warn('[useAICallFlow] Failed to parse WS message');
      return;
    }

    logger.debug('[useAICallFlow] Received:', msg.type);
    const session = callSessionRef.current;
    if (!session) return;

    switch (msg.type) {
      case 'JOINED': {
        logger.info('[useAICallFlow] JOINED received. Sending CALL_INVITE...');
        setCallStatus('inviting');

        sendMessage({
          type: 'CALL_INVITE',
          roomId: session.roomId,
          from: session.callerSignalId,
          to: session.aiSignalId,
          data: { callId: session.callId, cloneUserUuid: userUuid ?? '', mediaType: 'VOICE' },
        });

        inviteTimeoutRef.current = setTimeout(() => {
          logger.warn('[useAICallFlow] CALL_INVITE timeout after 10s');
          _cleanup('AI 트윈이 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
        }, INVITE_TIMEOUT_MS);
        break;
      }

      case 'CALL_ACCEPT': {
        // 타임아웃 해제
        if (inviteTimeoutRef.current) {
          clearTimeout(inviteTimeoutRef.current);
          inviteTimeoutRef.current = null;
        }

        setCallStatus('connecting');
        logger.info('[useAICallFlow] CALL_ACCEPT received. Creating offer...');

        try {
          const offer = await createOffer();
          sendMessage({
            type: 'OFFER',
            roomId: session.roomId,
            from: session.callerSignalId,
            to: session.aiSignalId,
            data: {
              callId: session.callId,
              sdp: { type: 'offer', sdp: offer.sdp ?? '' },
            },
          });
        } catch (err) {
          logger.error('[useAICallFlow] Failed to create offer:', err);
          await _cleanup('통화 연결에 실패했습니다.');
        }
        break;
      }

      case 'OFFER': {
        // AI 주도 재협상: 수신한 메시지의 from/to를 뒤집어서 ANSWER 발송 (백엔드 컨벤션)
        const offerData = msg.data as OfferData;
        try {
          logger.info('[useAICallFlow] OFFER received from AI. Applying and creating answer...');
          await applyOffer(offerData.sdp);
          const answer = await createAnswer();
          sendMessage({
            type: 'ANSWER',
            roomId: msg.roomId,
            from: msg.to,
            to: msg.from,
            data: {
              callId: offerData.callId,
              sdp: { type: 'answer', sdp: answer.sdp ?? '' },
            },
          });
        } catch (err) {
          logger.error('[useAICallFlow] Failed to handle AI OFFER:', err);
        }
        break;
      }

      case 'ANSWER': {
        const answerData = msg.data as AnswerData;
        try {
          await applyAnswer(answerData.sdp);
        } catch (err) {
          logger.error('[useAICallFlow] Failed to apply answer:', err);
        }
        break;
      }

      case 'ICE': {
        const iceData = msg.data as IceData;
        try {
          await applyIceCandidate(iceData.candidate);
        } catch (err) {
          logger.error('[useAICallFlow] Failed to apply ICE candidate:', err);
        }
        break;
      }

      case 'CALL_REJECT': {
        const rejectData = msg.data as CallRejectData | null;
        if (rejectData) {
          logger.warn('[useAICallFlow] CALL_REJECT reason:', rejectData.reason, rejectData.detail);
        }
        // AI_SERVER_UNAVAILABLE(백엔드가 CALL_INVITE를 AI 서버로 릴레이 자체를 못 한 경우)만
        // 별도 문구로 구분한다 — 그 외 기존 4개 사유는 이미 있던 동작(고정 문구) 그대로 유지.
        const message =
          rejectData?.reason === 'AI_SERVER_UNAVAILABLE'
            ? 'AI 트윈 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
            : 'AI 트윈이 통화를 거절했습니다.';
        await _cleanup(message);
        break;
      }

      case 'SIGNALING_ERROR': {
        const signalingErrorData = msg.data as SignalingErrorData | null;
        logger.warn(
          '[useAICallFlow] SIGNALING_ERROR reason:',
          signalingErrorData?.reason,
          signalingErrorData?.detail
        );

        // 이미 hangUp()으로 종료 중이면(예: 방금 보낸 CALL_END 자체가 전달 실패) 상대는 어차피
        // 곧 정리될 예정이니 에러 화면을 띄우지 않는다. _performHangUp이 CALL_END 발송 직후
        // isHangingUpRef를 true로 세운 채 stopAndUpload/endCall(둘 다 시간이 걸림)을 기다리는
        // 동안 이 메시지가 도착할 수 있는데, 가드가 없으면 여기서 _cleanup(message)이 error를
        // 먼저 세팅해버리고, 뒤이어 _performHangUp 자신의 _cleanup()은 메시지 없이 호출되어
        // (errorMessage가 falsy면 setError를 안 함) 그 error를 못 지운다 — 정상적으로 전화를
        // 끊었는데도 ai-call.tsx의 "callStatus==='ended' && !error" 자동 뒤로가기 조건이
        // 깨지면서 에러 화면이 잘못 뜬다.
        if (isHangingUpRef.current) break;

        await _cleanup('AI 트윈과의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
        break;
      }

      case 'CALL_END':
        logger.info('[useAICallFlow] CALL_END received from AI');
        await _performHangUp();
        break;

      default:
        logger.debug('[useAICallFlow] Unhandled message type:', msg.type);
    }
  }, [createOffer, createAnswer, applyAnswer, applyOffer, applyIceCandidate, sendMessage, userUuid]);

  // ─────────────────────────────────────────────
  // 내부 정리 함수
  // ─────────────────────────────────────────────
  const _cleanup = useCallback(async (errorMessage?: string, targetStatus: CallStatus = 'ended') => {
    logger.debug('[useAICallFlow] Cleaning up...');

    // 대기 중인 startCall 시도가 있다면 여기서 무효화한다 — Promise.allSettled가 끝난 뒤
    // 이 값이 자기 시작 시점과 달라진 걸 보고, 뒤늦게 로컬 연결을 이어가지 않는다.
    startAttemptIdRef.current += 1;

    if (inviteTimeoutRef.current) {
      clearTimeout(inviteTimeoutRef.current);
      inviteTimeoutRef.current = null;
    }

    const ws = wsRef.current;
    if (ws) {
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      if (ws.readyState === WebSocket.OPEN) ws.close();
      wsRef.current = null;
    }

    closeWebRTC();
    InCallManager.stop();
    setIsSpeakerOn(true);
    setIsMuted(false);
    callSessionRef.current = null;
    isHangingUpRef.current = false;

    if (errorMessage) {
      setError(errorMessage);
    }

    setCallStatus(targetStatus);
  }, [closeWebRTC]);

  // ─────────────────────────────────────────────
  // 통화 종료 내부 처리 (녹음 업로드 포함)
  // ─────────────────────────────────────────────
  const _performHangUp = useCallback(async () => {
    if (isHangingUpRef.current) return;
    const session = callSessionRef.current;
    if (!session) {
      // 아직 서버에 알릴 세션(REST 응답)이 없는 시점의 취소 — 알릴 대상이 없으니 로컬 정리만 한다.
      // 여기서 그냥 return하면 callStatus가 안 바뀌어 화면 전환(연결 취소)이 안 일어난다.
      await _cleanup();
      return;
    }

    isHangingUpRef.current = true;
    setCallStatus('ending');
    logger.info('[useAICallFlow] Hanging up...');

    // 1. WebSocket CALL_END 발송
    sendMessage({
      type: 'CALL_END',
      roomId: session.roomId,
      from: session.callerSignalId,
      to: session.aiSignalId,
      data: { callId: session.callId },
    });

    // 2. 녹음 중단 및 S3 업로드 (내 목소리 → AI 학습/분석용)
    const recordingUrl = await stopAndUpload(userUuid ?? '');

    // TODO: 통화 기록(대화 내용) 저장
    // 나와 AI 서버가 주고받은 대화 내용을 callId 기준으로 저장해야 합니다.
    // 구현 방향 (백엔드 협의 필요):
    //   - 방법 A (권장): 백엔드가 callId별 AI 응답 텍스트 + 사용자 음성 STT 결과를 저장
    //                    → GET /calls/{callId}/transcript 로 조회
    //   - 방법 B: 클라이언트에서 통화 중 실시간 STT(useSTT)로 수집한 텍스트를 endCall 시 전송
    // 현재는 recordingUrl(S3 음성 파일)만 전달하며, 텍스트 기록은 추후 추가 예정

    // 3. REST API 종료 알림
    try {
      await endCall(session.callId, recordingUrl);
    } catch (err) {
      logger.error('[useAICallFlow] endCall REST failed:', err);
    }

    // 4. 정리
    await _cleanup();
  }, [sendMessage, stopAndUpload, userUuid, endCall, _cleanup]);

  // ─────────────────────────────────────────────
  // 통화 시작 (공개 API)
  // ─────────────────────────────────────────────
  const startCall = useCallback(async () => {
    if (!userUuid) {
      // 자동 시작 구조라 idle로 되돌리기만 하면 재시도 버튼이 없어 빠져나갈 수 없다 —
      // 에러 상태로 전이시켜 CallErrorFallback의 뒤로가기로 나갈 수 있게 한다.
      setError('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    const myAttemptId = ++startAttemptIdRef.current;

    setError(null);
    setCallStatus('initiating');
    logger.info('[useAICallFlow] Starting call...');

    try {
      // ─── 전제조건 1: 마이크 권한 확인/요청 ───
      // 통화 시작 전에 권한을 미리 요청합니다.
      // 권한이 없으면 WebRTC 초기화 자체가 실패하므로 여기서 조기 차단합니다.
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        logger.warn('[useAICallFlow] Microphone permission denied');
        // 화면 진입 시 자동으로 통화가 걸리는 구조라(수동 "다시 시작" 버튼이 없음),
        // 여기서 idle로만 되돌리면 사용자가 나갈 방법 없는 무한 로딩 화면에 갇힌다.
        // CallErrorFallback(뒤로가기 버튼 있음)이 뜨도록 에러 상태로 전이시킨다.
        await _cleanup('통화를 시작하려면 마이크 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.', 'idle');
        return;
      }
      logger.debug('[useAICallFlow] Microphone permission granted');

      // ─── 전제조건 2: iOS 오디오 세션을 녹음 가능 모드로 사전 설정 ───
      // WebRTC(getUserMedia)와 expo-audio가 같은 마이크를 공유하려면
      // iOS AVAudioSession이 처음부터 .playAndRecord 모드여야 합니다.
      // initWebRTC() 호출 전에 설정해야 충돌이 발생하지 않습니다.
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      logger.debug('[useAICallFlow] Audio mode configured for recording');

      // 1+2. REST API(방 생성)와 WebRTC 초기화(마이크 스트림 획득)는 서로의 결과값이
      // 필요 없는 독립적인 작업이다(roomId 등은 WebSocket JOIN 시에만 필요) — 순차 실행 시
      // 두 왕복시간이 그대로 더해지던 걸, 병렬 실행으로 느린 쪽 하나만 기다리면 되게 줄인다.
      // allSettled를 쓰는 이유: Promise.all은 하나만 실패해도 다른 쪽 결과(특히 REST 성공 시
      // 생성된 callId)를 잃어버려서, REST는 성공하고 WebRTC만 실패한 경우 서버에 생성된
      // 통화방을 정리(보상 종료)할 방법이 없어진다.
      const [initiateResult, webrtcResult] = await Promise.allSettled([
        initiateCall(userUuid, {
          callerUserUuid: userUuid,
          mediaType: 'VOICE',
        }),
        initWebRTC(),
      ]);

      if (initiateResult.status === 'rejected') {
        throw initiateResult.reason;
      }
      const response = initiateResult.value;
      if (!response.isSuccess) throw new Error(response.message);

      const { callId, roomId, callerSignalId, aiSignalId } = response.result;

      // 이 시도가 REST/WebRTC 초기화를 기다리는 동안 사용자가 취소했거나(hangUp) 화면이
      // 언마운트됐다면(_cleanup이 attemptId를 무효화) 서버엔 이미 방이 생겼으니 로컬 연결을
      // 이어가지 말고 보상 종료 요청만 보낸다.
      if (myAttemptId !== startAttemptIdRef.current) {
        logger.warn('[useAICallFlow] startCall attempt cancelled during setup — sending compensating hangup');
        // 취소 시점의 _cleanup()은 initWebRTC()가 끝나기 전에 이미 지나갔으므로, 방금 막
        // 만들어진 PeerConnection/마이크 스트림은 아무도 안 닫은 상태다 — useWebRTCCall.initialize()가
        // pcRef.current를 먼저 세팅한 뒤 getUserMedia()를 호출하므로, webrtcResult가 fulfilled든
        // rejected(getUserMedia 실패 등)든 pcRef가 채워져 있을 수 있다. 무조건 호출한다
        // (closeWebRTC()는 pc가 없으면 안전하게 no-op).
        closeWebRTC();
        try {
          await endCall(callId, '');
        } catch (err) {
          logger.error('[useAICallFlow] compensating endCall failed:', err);
        }
        return;
      }

      callSessionRef.current = { callId, roomId, callerSignalId, aiSignalId };

      if (webrtcResult.status === 'rejected') {
        // REST 세션은 이미 만들어졌으니 로컬 정리만으론 부족하다 — catch 블록에서
        // callSessionRef가 있는 걸 보고 정식 hangUp 경로(CALL_END + endCall)로 보낸다.
        throw webrtcResult.reason;
      }

      // 3. WebSocket 연결
      setCallStatus('joining');
      const ws = new WebSocket(`${WS_BASE_URL}/ws/signaling`);
      wsRef.current = ws;

      ws.onerror = (e) => {
        logger.error('[useAICallFlow] WebSocket error:', e);
        _cleanup('시그널링 서버 연결에 실패했습니다.');
      };

      ws.onclose = () => {
        logger.debug('[useAICallFlow] WebSocket closed');
      };

      ws.onmessage = handleMessage;

      ws.onopen = () => {
        logger.info('[useAICallFlow] WebSocket connected. Sending JOIN...');

        // 4. JOIN 발송
        ws.send(JSON.stringify({
          type: 'JOIN',
          roomId,
          from: callerSignalId,
          to: 'server',
          data: null,
        }));
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '통화를 시작할 수 없습니다.';
      logger.error('[useAICallFlow] startCall failed:', err);
      if (callSessionRef.current) {
        // REST로 서버에 통화방이 이미 생성된 상태 — 로컬 정리만으론 서버에 고아 통화가 남는다.
        // 정식 hangUp 경로(CALL_END + endCall)로 서버도 함께 정리한다. _performHangUp이 호출하는
        // _cleanup()엔 메시지를 안 넘기므로, 에러 문구는 먼저 세팅해서 CallErrorFallback에 남긴다.
        setError(message);
        await _performHangUp();
      } else {
        await _cleanup(message, 'idle');
      }
    }
  }, [userUuid, initWebRTC, handleMessage, _cleanup, _performHangUp, endCall, closeWebRTC]);

  // ─────────────────────────────────────────────
  // 통화 종료 (공개 API)
  // ─────────────────────────────────────────────
  const hangUp = useCallback(async () => {
    await _performHangUp();
  }, [_performHangUp]);

  // 언마운트 시 자동 정리
  useEffect(() => {
    return () => {
      _cleanup();
    };
  }, [_cleanup]);

  return {
    callStatus,
    remoteStream: remoteStream as MediaStream | null,
    startCall,
    hangUp,
    error,
    isSpeakerOn,
    toggleSpeaker,
    isMuted,
    toggleMute,
  };
}
