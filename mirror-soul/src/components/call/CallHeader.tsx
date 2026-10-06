import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useCallAppearance } from './CallAppearance';
import { formatCallTime } from '@/src/utils/formatCallTime';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

const labels: Record<CallStatus, string> = { idle: '연결 준비', initiating: '연결 준비', joining: '연결 중', inviting: '연결 중', connecting: '연결 중', connected: '연결됨', reconnecting: '연결 확인 중', ending: '종료 확인 중', ended: '대화 종료' };
export default function CallHeader({ callStatus, callDurationSeconds = 0, isPreview = false, targetName = '내 트윈', isMuted = false }: {
  callStatus: CallStatus; callDurationSeconds?: number; isPreview?: boolean; targetName?: string; isMuted?: boolean;
}) {
  const { colors, palette } = useCallAppearance();
  const connected = callStatus === 'connected' || callStatus === 'reconnecting';
  return <View style={styles.header}>
    <View style={styles.heading}><Text accessibilityRole="header" variant="heading" numberOfLines={2} accessibilityLabel={targetName} style={[styles.name, { color: colors.text.primary }]}>{targetName}</Text>
      <Text style={[styles.badge, { color: palette.accentInk, backgroundColor: palette.tint }]}>{isPreview ? '미리보기' : 'AI 트윈'}</Text></View>
    <View style={styles.details}><View style={[styles.dot, { backgroundColor: callStatus === 'connected' ? palette.cyanInk : colors.text.muted }]} />
      <Text style={[styles.status, { color: colors.text.secondary }]}>{labels[callStatus]}{connected ? ` · 대화 경과 ${formatCallTime(callDurationSeconds)}` : ''}</Text>
      {connected && isMuted && <Text style={[styles.muted, { color: colors.text.secondary, backgroundColor: colors.background.glass }]}>마이크 꺼짐</Text>}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 10, gap: 7 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { flex: 1, minWidth: 0, fontSize: 21, lineHeight: 29, fontWeight: '600' },
  badge: { flexShrink: 0, fontSize: 11, lineHeight: 18, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  details: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  status: { flexShrink: 1, fontSize: 12, lineHeight: 20 },
  muted: { fontSize: 11, lineHeight: 18, paddingHorizontal: 7, borderRadius: 7 },
});
