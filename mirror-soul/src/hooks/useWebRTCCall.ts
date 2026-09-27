import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import { logger } from '../utils/logger';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

/**
 * WebRTC PeerConnection 생명주기를 관리하는 훅 (SoC)
 *
 * 역할: RTCPeerConnection 생성, 로컬 마이크 스트림, 원격 오디오 스트림 수신
 * 시그널링 로직은 useAICallFlow에서 담당합니다.
 */
export function useWebRTCCall() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [iceConnectionState, setIceConnectionState] = useState<string>('new');
  // 내 카메라 셀프뷰 전용 스트림 — 의도적으로 PeerConnection에 addTrack하지 않는다.
  // AI 서버(aiortc)는 초기 offer 이후의 갱신 협상을 클라이언트가 먼저 거는 경우를 검증한 적이
  // 없고, 비디오 트랙을 받아도 어차피 버리므로(model_calling/webrtc/peer.py on_track) 지금은
  // "내 화면에 내 카메라를 보여주는" 로컬 프리뷰로 범위를 좁힌다.
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null);

  // ICE 후보 발생 시 시그널링 서버로 전달하기 위한 콜백 Ref
  const onLocalIceCandidateCb = useRef<((candidate: RTCIceCandidate) => void) | null>(null);

  // Remote Description 등록 전 도착한 ICE 후보 임시 버퍼
  const pendingIceCandidatesRef = useRef<RTCIceCandidate[]>([]);

  /** PeerConnection 초기화 및 로컬 마이크 스트림 획득 */
  const initialize = useCallback(async () => {
    logger.debug('[useWebRTCCall] Initializing PeerConnection...');

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    // 원격 오디오 스트림 수신
    pc.addEventListener('track', (event: any) => {
      logger.debug('[useWebRTCCall] Remote track received');
      if (event.streams?.[0]) {
        setRemoteStream(event.streams[0]);
      }
    });

    // 로컬 ICE 후보 발생 시 콜백으로 전달
    pc.addEventListener('icecandidate', (event: any) => {
      if (event.candidate) {
        logger.debug('[useWebRTCCall] Local ICE candidate generated');
        onLocalIceCandidateCb.current?.(event.candidate);
      }
    });

    // 연결 상태 변화 감지
    pc.addEventListener('iceconnectionstatechange', () => {
      const state = pc.iceConnectionState;
      logger.debug('[useWebRTCCall] ICE connection state:', state);
      setIceConnectionState(state);
    });

    // 로컬 마이크 스트림 획득 후 PeerConnection에 추가
    try {
      const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getTracks().forEach((track: any) => {
        pc.addTrack(track, stream);
      });
      logger.debug('[useWebRTCCall] Local audio track added');
    } catch (err) {
      logger.error('[useWebRTCCall] Failed to get microphone stream:', err);
      throw err;
    }
  }, []);

  /** 내 카메라 셀프뷰 시작 — 통화 마이크 스트림과 별개의 video-only 스트림을 새로 획득한다. */
  const enableCamera = useCallback(async () => {
    if (localCameraStream) return; // 이미 켜져 있으면 중복 획득하지 않는다
    const stream = await mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } });
    setLocalCameraStream(stream as unknown as MediaStream);
    logger.debug('[useWebRTCCall] Local camera preview stream acquired');
  }, [localCameraStream]);

  /** 내 카메라 셀프뷰 종료 — 트랙을 멈춰서 카메라 하드웨어(및 표시등)를 실제로 끈다. */
  const disableCamera = useCallback(() => {
    setLocalCameraStream((prev) => {
      prev?.getTracks().forEach((track: any) => track.stop());
      return null;
    });
    logger.debug('[useWebRTCCall] Local camera preview stream released');
  }, []);

  /** 버퍼링된 ICE 후보를 일괄 적용하는 내부 헬퍼 */
  const flushPendingIceCandidates = useCallback(async (pc: any) => {
    const pending = pendingIceCandidatesRef.current;
    if (pending.length === 0) return;
    pendingIceCandidatesRef.current = [];
    for (const candidate of pending) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    logger.debug('[useWebRTCCall] Flushed pending ICE candidates:', pending.length);
  }, []);

  /** SDP Offer 생성 */
  const createOffer = useCallback(async (): Promise<any> => {
    const pc = pcRef.current;
    if (!pc) throw new Error('PeerConnection이 초기화되지 않았습니다.');

    const offer = await pc.createOffer({});
    await pc.setLocalDescription(new RTCSessionDescription(offer));
    logger.debug('[useWebRTCCall] Offer created and set as local description');
    return offer;
  }, []);

  /** SDP Answer 생성 (AI의 Offer에 대한 응답 시) */
  const createAnswer = useCallback(async (): Promise<any> => {
    const pc = pcRef.current;
    if (!pc) throw new Error('PeerConnection이 초기화되지 않았습니다.');
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(new RTCSessionDescription(answer));
    logger.debug('[useWebRTCCall] Answer created and set as local description');
    return answer;
  }, []);

  /** AI 서버의 SDP Answer 적용 */
  const applyAnswer = useCallback(async (sdp: any): Promise<void> => {
    const pc = pcRef.current;
    if (!pc) throw new Error('PeerConnection이 초기화되지 않았습니다.');

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    logger.debug('[useWebRTCCall] Remote answer applied');
    await flushPendingIceCandidates(pc);
  }, [flushPendingIceCandidates]);

  /** AI 서버의 SDP Offer 적용 (재협상 시) */
  const applyOffer = useCallback(async (sdp: any): Promise<void> => {
    const pc = pcRef.current;
    if (!pc) throw new Error('PeerConnection이 초기화되지 않았습니다.');
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    logger.debug('[useWebRTCCall] Remote offer applied');
    await flushPendingIceCandidates(pc);
  }, [flushPendingIceCandidates]);

  /** AI 서버의 ICE 후보 적용 (Remote Description 미등록 시 버퍼링) */
  const applyIceCandidate = useCallback(async (candidate: RTCIceCandidate): Promise<void> => {
    const pc = pcRef.current;
    if (!pc) throw new Error('PeerConnection이 초기화되지 않았습니다.');

    if (!pc.remoteDescription) {
      pendingIceCandidatesRef.current.push(candidate);
      logger.debug('[useWebRTCCall] Buffered ICE candidate (no remote description yet)');
      return;
    }
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    logger.debug('[useWebRTCCall] Remote ICE candidate applied');
  }, []);

  /** 정리: PeerConnection 및 트랙 해제 */
  const close = useCallback(() => {
    setLocalCameraStream((prev) => {
      prev?.getTracks().forEach((track: any) => track.stop());
      return null;
    });

    const pc = pcRef.current;
    if (!pc) return;

    pendingIceCandidatesRef.current = [];
    pc.getSenders().forEach((sender: any) => {
      sender.track?.stop();
    });
    pc.close();
    pcRef.current = null;
    setRemoteStream(null);
    setIceConnectionState('closed');
    logger.debug('[useWebRTCCall] PeerConnection closed and cleaned up');
  }, []);

  // 언마운트 시 자동 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      close();
    };
  }, [close]);

  return {
    remoteStream,
    localCameraStream,
    iceConnectionState,
    onLocalIceCandidateCb,
    initialize,
    enableCamera,
    disableCamera,
    createOffer,
    createAnswer,
    applyAnswer,
    applyOffer,
    applyIceCandidate,
    close,
  };
}
