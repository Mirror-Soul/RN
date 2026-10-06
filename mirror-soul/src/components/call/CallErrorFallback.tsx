import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import CallScreenBackground from './CallScreenBackground';

export default function CallErrorFallback({ message, onBack, onRetry, onSettings, busy = false, retryLabel = '다시 연결', title = '연결을 마치지 못했어요', secondaryMessage }: {
  message: string; onBack: () => void; onRetry?: () => void; onSettings?: () => void; busy?: boolean; retryLabel?: string; title?: string; secondaryMessage?: string | null;
}) {
  const { colors, palette } = useMatchingDesign();
  return <CallScreenBackground><SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <View style={[styles.icon, { backgroundColor: palette.tint }]}><Feather name="phone-off" size={28} color={palette.accentInk} /></View>
    <Text accessibilityRole="header" variant="heading" style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
    <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text>
    {!!secondaryMessage && <Text style={[styles.message, { color: colors.text.secondary }]}>{secondaryMessage}</Text>}
    {busy && <ActivityIndicator color={palette.accentInk} />}
    {busy && <Text style={[styles.message, { color: colors.text.muted }]}>통화 상태를 확인하고 있어요…</Text>}
    {(onRetry || onSettings) && <Pressable onPress={onSettings ?? onRetry} disabled={busy} accessibilityRole="button" accessibilityLabel={onSettings ? '기기 설정 열기' : retryLabel} accessibilityState={{ disabled: busy }} style={[styles.button, { backgroundColor: palette.buttonBase, borderColor: palette.buttonBorder, opacity: busy ? 0.5 : 1 }]}><Text style={[styles.buttonText, { color: colors.text.primary }]}>{onSettings ? '기기 설정 열기' : retryLabel}</Text></Pressable>}
    {onSettings && onRetry && <Pressable onPress={onRetry} disabled={busy} accessibilityRole="button" accessibilityLabel="권한 확인 후 다시 연결" accessibilityState={{ disabled: busy }} style={[styles.button, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}><Text style={[styles.buttonText, { color: colors.text.primary }]}>권한 확인 후 다시 연결</Text></Pressable>}
    <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="이전 화면으로 돌아가기" style={[styles.button, { borderColor: colors.border.primary, backgroundColor: colors.background.card }]}><Text style={[styles.buttonText, { color: colors.text.secondary }]}>돌아가기</Text></Pressable>
  </ScrollView></SafeAreaView></CallScreenBackground>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  icon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { alignSelf: 'stretch', fontSize: 22, lineHeight: 32, fontWeight: '600', textAlign: 'center' },
  message: { alignSelf: 'stretch', fontSize: 14, lineHeight: 23, textAlign: 'center' },
  button: { alignSelf: 'stretch', minHeight: 52, borderWidth: 1, borderRadius: 18, padding: 14, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 15, lineHeight: 23, fontWeight: '500', textAlign: 'center' },
});
