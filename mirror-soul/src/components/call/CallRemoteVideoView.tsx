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
 * AI 서버가 아직 비디오 트랙을 보내지 않으므로(현재는 음성 전용),
 * remoteStream에 비디오 트랙이 없으면 기존 CallAIAvatar를 자리표시자로 그대로 쓴다.
 * 비디오 트랙이 생기면 자동으로 RTCView가 대신 렌더링된다 — 상위(ai-call.tsx)를
 * 손댈 필요 없이 이 컴포넌트만 실제 스트림을 받게 되면 전환된다.
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
