import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import type { TalkLogListResult } from '@/src/types/api/history';

/** Call context scrolls with the transcript, leaving the persistent header compact. */
export default function CallDetailSummary({ data, refreshFailed = false }: { data: TalkLogListResult; refreshFailed?: boolean }) {
  const { colors, palette } = useMatchingDesign();
  const date = new Date(data.startedAt);
  const dateLabel = Number.isFinite(date.getTime())
    ? `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 · ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : '일시 정보 없음';
  const canEdit = data.talkLogs.some(log => log.editable && log.speaker === 'MY_TWIN');
  return <View style={styles.summary}>
    <View style={styles.meta}>
      <Text style={[styles.date, { color: colors.text.secondary }]}>{dateLabel}</Text>
      {Number.isSafeInteger(data.callNumber) && data.callNumber > 0 && <Text style={[styles.badge, { color: palette.accentInk, backgroundColor: palette.tint }]}>{data.callNumber}번째 통화</Text>}
    </View>
    <Text variant="heading" accessibilityRole="header" style={[styles.description, { color: colors.text.primary }]}>{data.description || '트윈과 나눈 대화'}</Text>
    <View style={styles.context}><Feather name="headphones" size={14} color={palette.cyanInk} /><Text style={[styles.note, { color: colors.text.secondary }]}>AI 트윈과 나눈 대화 기록이에요.</Text></View>
    {canEdit && <View style={[styles.editNote, { backgroundColor: palette.coolTint }]}><Feather name="edit-3" size={15} color={palette.cyanInk} /><Text style={[styles.note, { color: colors.text.secondary }]}>내 AI 트윈의 답변은 수정할 수 있어요. 수정한 문장은 이 기록에 저장돼요.</Text></View>}
    {refreshFailed && <Text accessibilityRole="alert" style={[styles.note, { flex: 0, color: colors.text.secondary }]}>새로고침하지 못했어요. 이전에 불러온 기록을 보여드려요. 더보기에서 다시 시도할 수 있어요.</Text>}
    <View style={[styles.divider, { backgroundColor: colors.border.primary }]} />
  </View>;
}
const styles = StyleSheet.create({
  summary: { paddingTop: 12, paddingBottom: 8, gap: 10 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  date: { fontSize: 12, lineHeight: 20 },
  badge: { fontSize: 11, lineHeight: 18, fontWeight: '500', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  description: { fontSize: 22, lineHeight: 31, fontWeight: '600' },
  context: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  note: { flex: 1, minWidth: 0, fontSize: 12, lineHeight: 20 },
  editNote: { flexDirection: 'row', gap: 8, borderRadius: 12, padding: 12 },
  divider: { height: StyleSheet.hairlineWidth, marginTop: 8 },
});
