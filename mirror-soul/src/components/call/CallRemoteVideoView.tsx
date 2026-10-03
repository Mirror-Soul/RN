import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RTCView, type MediaStream } from 'react-native-webrtc';
import CallAIAvatar from './CallAIAvatar';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

interface CallRemoteVideoViewProps {
  callStatus: CallStatus;
  remoteStream: MediaStream | null;
}

/**
 * 상대(AI 트윈) 영상통화 영역 — 화면 전체를 채우는 배경 레이어.
 *
 * AI 서버가 비디오 트랙을 보내면 RTCView로 자동 전환한다. 렌더 서비스 준비 전이거나
 * 비디오 트랙 협상에 실패한 경우에는 기존 CallAIAvatar를 안전한 자리표시자로 유지한다.
 */
export default function CallRemoteVideoView({ callStatus, remoteStream }: CallRemoteVideoViewProps) {
  const hasVideoTrack = (remoteStream?.getVideoTracks().length ?? 0) > 0;

  if (hasVideoTrack && remoteStream) {
    return (
      <View style={styles.container}>
        <RTCView streamURL={remoteStream.toURL()} style={styles.video} objectFit="cover" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CallAIAvatar callStatus={callStatus} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    flex: 1,
  },
});
