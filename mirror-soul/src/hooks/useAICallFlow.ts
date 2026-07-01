import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { MediaStream } from 'react-native-webrtc';
import { AudioModule, setAudioModeAsync } from 'expo-audio';
import { useAuthStore } from '../store/useAuthStore';
import { initiateCall, setCallInProgress, endCall } from '../services/callService';
import { useWebRTCCall } from './useWebRTCCall';
import { useCallRecording } from './useCallRecording';
import { logger } from '../utils/logger';
import type { SignalingMessage, CallAcceptData, AnswerData, IceData, OfferData } from '../types/signaling';

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

      setCallInProgress(session.callId).catch((err) => {
        logger.error('[useAICallFlow] setCallInProgress failed:', err);
      });

      startRecording().catch((err) => {
        logger.error('[useAICallFlow] startRecording failed:', err);
      });
    }
  }, [iceConnectionState, callStatus, startRecording]);

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

      case 'CALL_REJECT':
        await _cleanup('AI 트윈이 통화를 거절했습니다.');
        break;

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
    if (!session) return;

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
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

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
        Alert.alert(
          '마이크 권한 필요',
          '통화를 시작하려면 마이크 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.'
        );
        setCallStatus('idle');
        return;
      }
      logger.debug('[useAICallFlow] Microphone permission granted');

      // ─── 전제조건 2: iOS 오디오 세션을 녹음 가능 모드로 사전 설정 ───
      // WebRTC(getUserMedia)와 expo-audio가 같은 마이크를 공유하려면
      // iOS AVAudioSession이 처음부터 .playAndRecord 모드여야 합니다.
      // initWebRTC() 호출 전에 설정해야 충돌이 발생하지 않습니다.
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      logger.debug('[useAICallFlow] Audio mode configured for recording');

      // 1. REST API: 방 생성
      const response = await initiateCall(userUuid, {
        callerUserUuid: userUuid,
        mediaType: 'VOICE',
      });

      if (!response.isSuccess) throw new Error(response.message);

      const { callId, roomId, callerSignalId, aiSignalId } = response.result;
      callSessionRef.current = { callId, roomId, callerSignalId, aiSignalId };

      // 2. WebRTC 초기화 (마이크 스트림 획득)
      await initWebRTC();

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
      await _cleanup(message, 'idle');
    }
  }, [userUuid, initWebRTC, handleMessage, _cleanup]);

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
  };
}
