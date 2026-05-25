import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import type {
  RTCIceCandidateType,
  RTCSessionDescriptionType,
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

  // ICE 후보 발생 시 시그널링 서버로 전달하기 위한 콜백 Ref
  const onLocalIceCandidateCb = useRef<((candidate: RTCIceCandidateType) => void) | null>(null);

  /** PeerConnection 초기화 및 로컬 마이크 스트림 획득 */
  const initialize = useCallback(async () => {
    logger.debug('[useWebRTCCall] Initializing PeerConnection...');

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    // 원격 오디오 스트림 수신
    pc.ontrack = (event: any) => {
      logger.debug('[useWebRTCCall] Remote track received');
      if (event.streams?.[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // 로컬 ICE 후보 발생 시 콜백으로 전달
    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        logger.debug('[useWebRTCCall] Local ICE candidate generated');
        onLocalIceCandidateCb.current?.(event.candidate);
      }
    };

    // 연결 상태 변화 감지
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      logger.debug('[useWebRTCCall] ICE connection state:', state);
      setIceConnectionState(state);
    };

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

  /** SDP Offer 생성 */
  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionType> => {
    const pc = pcRef.current;
    if (!pc) throw new Error('PeerConnection이 초기화되지 않았습니다.');

    const offer = await pc.createOffer({});
    await pc.setLocalDescription(new RTCSessionDescription(offer));
    logger.debug('[useWebRTCCall] Offer created and set as local description');
    return offer as RTCSessionDescriptionType;
  }, []);

  /** AI 서버의 SDP Answer 적용 */
  const applyAnswer = useCallback(async (sdp: RTCSessionDescriptionType): Promise<void> => {
    const pc = pcRef.current;
    if (!pc) throw new Error('PeerConnection이 초기화되지 않았습니다.');

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    logger.debug('[useWebRTCCall] Remote answer applied');
  }, []);

  /** AI 서버의 ICE 후보 적용 */
  const applyIceCandidate = useCallback(async (candidate: RTCIceCandidateType): Promise<void> => {
    const pc = pcRef.current;
    if (!pc) throw new Error('PeerConnection이 초기화되지 않았습니다.');

    await pc.addIceCandidate(new RTCIceCandidate(candidate));
    logger.debug('[useWebRTCCall] Remote ICE candidate applied');
  }, []);

  /** 정리: PeerConnection 및 트랙 해제 */
  const close = useCallback(() => {
    const pc = pcRef.current;
    if (!pc) return;

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
    iceConnectionState,
    onLocalIceCandidateCb,
    initialize,
    createOffer,
    applyAnswer,
    applyIceCandidate,
    close,
  };
}
