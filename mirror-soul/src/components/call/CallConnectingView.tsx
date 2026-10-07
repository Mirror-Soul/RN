import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import CallHeader from './CallHeader';
import CallScreenBackground from './CallScreenBackground';
import type { CallStatus } from '@/src/hooks/useAICallFlow';

export default function CallConnectingView({ callStatus, onCancel, targetName = '내 트윈' }: { callStatus: CallStatus; onCancel: () => void; targetName?: string }) {
  const { colors, palette } = useMatchingDesign();
  const ending = callStatus === 'ending' || callStatus === 'ended';
  const [slow, setSlow] = useState(false);
  const label = ending ? '연결을 마무리하고 있어요' : ['idle', 'initiating'].includes(callStatus) ? '연결을 준비하고 있어요' : '트윈과 연결하고 있어요';
  useEffect(() => { const timer = setTimeout(() => setSlow(true), 6000); return () => clearTimeout(timer); }, []);
  useEffect(() => { AccessibilityInfo.announceForAccessibility(label); }, [label]);
  return <CallScreenBackground><SafeAreaView style={styles.screen}>
    <CallHeader callStatus={callStatus} targetName={targetName} />
    <ScrollView contentContainerStyle={styles.body}>
      <View style={[styles.identity, { backgroundColor: palette.tint, borderColor: palette.softBorder }]}><Text variant="heading" style={[styles.initial, { color: palette.accentInk }]}>{Array.from(targetName)[0] || 'M'}</Text></View>
      <Text variant="heading" style={[styles.title, { color: colors.text.primary }]}>{label}</Text>
      <ActivityIndicator color={palette.accentInk} />
      <Text style={[styles.copy, { color: colors.text.secondary }]}>{ending ? '소리와 영상은 껐어요. 통화 종료를 확인하고 있어요.' : slow ? '평소보다 연결에 시간이 걸리고 있어요.' : '마이크로 대화하고, 트윈의 영상은 이 화면에서 볼 수 있어요.'}</Text>
    </ScrollView>
    <View style={styles.footer}><Pressable onPress={onCancel} disabled={ending} accessibilityRole="button" accessibilityLabel="통화 연결 취소" accessibilityState={{ disabled: ending }}
      style={({ pressed }) => [styles.cancel, { backgroundColor: colors.background.card, borderColor: colors.border.primary, opacity: ending ? 0.5 : pressed ? 0.7 : 1 }]}><Feather name="x" size={18} color={colors.text.secondary} /><Text style={[styles.cancelText, { color: colors.text.primary }]}>{ending ? '종료 확인 중' : '연결 취소'}</Text></Pressable></View>
  </SafeAreaView></CallScreenBackground>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 }, body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 20, gap: 18 },
  identity: { width: 104, height: 104, borderRadius: 36, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  initial: { fontSize: 38, lineHeight: 50, fontWeight: '600' },
  title: { alignSelf: 'stretch', fontSize: 22, lineHeight: 32, fontWeight: '600', textAlign: 'center' },
  copy: { alignSelf: 'stretch', fontSize: 14, lineHeight: 23, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  cancel: { minHeight: 52, borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  cancelText: { flexShrink: 1, fontSize: 15, lineHeight: 23, fontWeight: '500' },
});
