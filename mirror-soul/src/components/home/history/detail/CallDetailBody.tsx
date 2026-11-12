import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Platform, StyleSheet, View } from 'react-native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { canEditTalkLog } from '@/src/features/history/talkLogSpeaker';
import type { TalkLogResponse, TalkLogResult } from '@/src/types/api/history';
import ChatBubble from './parts/ChatBubble';
import TalkLogEditor from './TalkLogEditor';

interface Props {
  talkLogs: TalkLogResult[];
  partnerName: string;
  onSaveTalkLog: (id: number, text: string) => Promise<TalkLogResponse>;
  isSaving: boolean;
  onEditingChange?: (editing: boolean) => void;
  summary?: React.ReactElement;
  /** 통화 상대가 나 자신인 기록(트윈 시뮬레이션). 내 트윈 답변이 PARTNER_TWIN으로 온다. */
  selfCall?: boolean;
  /** 방금 끝난 통화의 대화가 아직 서버에서 오는 중인지. */
  transcriptSettling?: boolean;
}
interface Item { log: TalkLogResult; hideSpeakerLabel: boolean }
interface Draft { id: number; original: string; text: string }

export default function CallDetailBody({ talkLogs, partnerName, onSaveTalkLog, isSaving, onEditingChange, summary, selfCall = false, transcriptSettling = false }: Props) {
  const { colors } = useMatchingDesign();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [closing, setClosing] = useState(false);
  const closingLock = useRef(false);
  const savingLock = useRef(false);
  const mounted = useRef(true);
  const logsRef = useRef(talkLogs);
  logsRef.current = talkLogs;
  const selfCallRef = useRef(selfCall);
  selfCallRef.current = selfCall;
  const draftRef = useRef(draft);
  draftRef.current = draft;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const isEditing = draft !== null;
  useEffect(() => { onEditingChange?.(isEditing); }, [isEditing, onEditingChange]);
  useEffect(() => () => { onEditingChange?.(false); }, [onEditingChange]);
  const items = useMemo(() => talkLogs.map((log, index) => ({ log, hideSpeakerLabel: talkLogs[index - 1]?.speaker === log.speaker })), [talkLogs]);
  const open = useCallback((id: number, text: string) => {
    if (savingLock.current || closingLock.current || draftRef.current) return;
    const log = logsRef.current.find(item => item.talkLogId === id);
    if (!log || !canEditTalkLog(log, selfCallRef.current)) return;
    const next = { id, original: text, text };
    draftRef.current = next;
    setDraft(next); setFailed(false);
  }, []);
  const finishClose = () => {
    if (!mounted.current) return;
    draftRef.current = null;
    closingLock.current = false;
    setDraft(null); setClosing(false); setFailed(false);
  };
  const close = () => {
    Keyboard.dismiss();
    // iOS must finish dismissing the editor before a call confirmation can present another Modal.
    if (Platform.OS === 'ios') { closingLock.current = true; setClosing(true); }
    else finishClose();
  };
  const cancel = () => {
    if (savingLock.current || closingLock.current || isSaving) return;
    const current = draftRef.current;
    if (current && current.text !== current.original) {
      Alert.alert('수정한 내용을 닫을까요?', '저장하지 않은 변경 내용은 사라져요.', [{ text: '계속 수정', style: 'cancel' }, { text: '닫기', style: 'destructive', onPress: () => { if (mounted.current && !savingLock.current && draftRef.current?.id === current.id) close(); } }]);
    } else close();
  };
  const save = async () => {
    const current = draftRef.current;
    if (!current || savingLock.current || closingLock.current || isSaving || !current.text.trim() || current.text.length > 2000) return;
    const log = logsRef.current.find(item => item.talkLogId === current.id);
    if (!log || !canEditTalkLog(log, selfCallRef.current)) return;
    if (current.text.trim() === current.original.trim()) { close(); return; }
    savingLock.current = true; setSaving(true); setFailed(false);
    try {
      await onSaveTalkLog(current.id, current.text.trim());
      if (mounted.current && draftRef.current?.id === current.id) close();
    } catch { if (mounted.current) setFailed(true); }
    finally { savingLock.current = false; if (mounted.current) setSaving(false); }
  };
  const renderItem = useCallback(({ item }: ListRenderItemInfo<Item>) => <ChatBubble message={item.log} partnerName={partnerName} hideSpeakerLabel={item.hideSpeakerLabel} onEditStart={open} selfCall={selfCall} />, [partnerName, open, selfCall]);
  const empty = transcriptSettling
    ? <View style={styles.empty} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.text.secondary} />
      <Text variant="heading" style={[styles.emptyTitle, { color: colors.text.primary }]}>대화 내용을 정리하고 있어요</Text>
      <Text style={[styles.emptyCopy, { color: colors.text.secondary }]}>통화가 끝난 직후에는 몇 초 정도 걸려요. 준비되면 자동으로 보여드릴게요.</Text>
    </View>
    : <View style={styles.empty}>
      <Text variant="heading" style={[styles.emptyTitle, { color: colors.text.primary }]}>아직 표시할 대화가 없어요</Text>
      <Text style={[styles.emptyCopy, { color: colors.text.secondary }]}>통화가 아주 짧았거나 대화가 인식되지 않으면 기록이 남지 않을 수 있어요. 더보기에서 기록을 새로고침할 수 있어요.</Text>
    </View>;
  const footer = !talkLogs.length ? null : transcriptSettling
    ? <View style={styles.settling} accessibilityLiveRegion="polite">
      <ActivityIndicator size="small" color={colors.text.muted} />
      <Text style={[styles.settlingText, { color: colors.text.muted }]}>남은 대화가 있는지 확인하고 있어요</Text>
    </View>
    : <Text style={[styles.end, { color: colors.text.muted }]}>대화 기록의 끝</Text>;
  return <View style={styles.container}>
    <FlashList data={items} extraData={selfCall} renderItem={renderItem} keyExtractor={item => String(item.log.talkLogId)}
      ListHeaderComponent={summary} ListEmptyComponent={empty} ListFooterComponent={footer}
      contentContainerStyle={{ paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right, paddingBottom: 24 + insets.bottom }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" maintainVisibleContentPosition={{ disabled: true }} />
    {draft && <TalkLogEditor text={draft.text} visible={!closing} onDismiss={() => { if (closingLock.current) finishClose(); }} saving={saving || isSaving || closing} failed={failed} onCancel={cancel} onSave={() => { void save(); }} onChange={text => {
      if (savingLock.current || closingLock.current || isSaving) return;
      const current = draftRef.current;
      if (current) { const next = { ...current, text }; draftRef.current = next; setDraft(next); setFailed(false); }
    }} />}
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0 },
  empty: { paddingVertical: 40, gap: 8, alignItems: 'center' },
  emptyTitle: { fontSize: 18, lineHeight: 28, fontWeight: '600', textAlign: 'center' },
  emptyCopy: { fontSize: 14, lineHeight: 23, textAlign: 'center' },
  end: { fontSize: 11, lineHeight: 18, textAlign: 'center', paddingVertical: 16 },
  settling: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  settlingText: { fontSize: 11, lineHeight: 18 },
});
