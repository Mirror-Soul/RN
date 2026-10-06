import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { RTCView, type MediaStream } from 'react-native-webrtc';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useCallAppearance } from './CallAppearance';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

export default function CallRemoteVideoView({ callStatus, remoteStream, targetName = '내 트윈', isPreview = false }: {
  callStatus: CallStatus; remoteStream: MediaStream | null; targetName?: string; isPreview?: boolean;
}) {
  const { colors, palette } = useCallAppearance();
  const hasVideo = (remoteStream?.getVideoTracks().length ?? 0) > 0;
  const url = hasVideo ? remoteStream?.toURL() : undefined;
  const currentURL = useRef(url);
  currentURL.current = url;
  const [dimensionsReceived, setDimensionsReceived] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => { setDimensionsReceived(false); setSlow(false); const timer = setTimeout(() => setSlow(true), 6000); return () => clearTimeout(timer); }, [url]);
  const ending = callStatus === 'ending' || callStatus === 'ended';
  return <View testID="call-media-surface" style={[styles.container, { backgroundColor: colors.background.primary }]}>
    {url && !ending && <RTCView streamURL={url} style={styles.video} objectFit="contain" zOrder={0} onDimensionsChange={event => { if (currentURL.current === url && event.nativeEvent.width > 0 && event.nativeEvent.height > 0) setDimensionsReceived(true); }} />}
    {(!dimensionsReceived || ending || isPreview) && <View pointerEvents="none" style={[styles.fallback, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.avatar, { backgroundColor: palette.tint }]}><Text variant="heading" style={[styles.initial, { color: palette.accentInk }]}>{Array.from(targetName)[0] || 'M'}</Text></View>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>{ending ? '대화를 마쳤어요' : isPreview ? 'AI 영상이 표시되는 영역이에요' : slow ? '영상이 아직 표시되지 않고 있어요' : '영상을 연결하고 있어요'}</Text>
      {!ending && !isPreview && <ActivityIndicator color={palette.accentInk} />}
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, overflow: 'hidden' },
  video: { ...StyleSheet.absoluteFillObject },
  fallback: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 16 },
  avatar: { width: 72, height: 72, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 30, lineHeight: 40, fontWeight: '600' },
  copy: { fontSize: 13, lineHeight: 21, textAlign: 'center' },
});
