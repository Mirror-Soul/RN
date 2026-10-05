import React, { memo } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import type { TalkLogResult } from '@/src/types/api/history';
import { toTimeLabel } from '@/src/utils/formatHistoryDate';

interface ChatBubbleProps {
  message: TalkLogResult;
  partnerName: string;
  hideSpeakerLabel: boolean;
  onEditStart: (id: number, text: string) => void;
}
export function speakerLabel(speaker: TalkLogResult['speaker'], name: string) {
  switch (speaker) {
    case 'ME': return '나';
    case 'MY_TWIN': return '내 AI 트윈';
    case 'PARTNER': return name || '상대방';
    case 'PARTNER_TWIN': return `${name || '상대방'}의 AI 트윈`;
  }
}
function ChatBubble({ message, partnerName, hideSpeakerLabel, onEditStart }: ChatBubbleProps) {
  const { colors, palette } = useMatchingDesign();
  const { fontScale, width } = useWindowDimensions();
  const mine = message.speaker === 'ME' || message.speaker === 'MY_TWIN';
  const label = speakerLabel(message.speaker, partnerName);
  const time = Number.isFinite(new Date(message.startedAt).getTime()) ? toTimeLabel(message.startedAt) : null;
  const editable = message.editable && message.speaker === 'MY_TWIN';
  const fullWidth = width < 360 || fontScale > 1.3;
  return <View style={[styles.row, { alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: fullWidth ? '100%' : '90%' }]}>
    {!hideSpeakerLabel && <Text style={[styles.speaker, { color: mine ? palette.cyanInk : colors.text.secondary }]}>{label}</Text>}
    <View style={[styles.bubble, { backgroundColor: mine ? palette.coolTint : colors.background.card, borderColor: colors.border.primary }]}>
      <Text selectable accessibilityLabel={`${label}${time ? `, ${time}` : ''}, ${message.message}${message.edited ? ', 수정됨' : ''}`} style={[styles.message, { color: colors.text.primary }]}>{message.message || '인식된 대화 내용이 없어요.'}</Text>
      <View style={styles.meta}>
        {time && <Text style={[styles.time, { color: colors.text.muted }]}>{time}</Text>}
        {message.edited && <Text style={[styles.time, { color: colors.text.muted }]}>수정됨</Text>}
        {editable && <Pressable accessibilityRole="button" accessibilityLabel="내 AI 트윈 답변 수정" onPress={() => onEditStart(message.talkLogId, message.message)} style={({ pressed }) => [styles.edit, pressed && { backgroundColor: palette.tint }]}>
          <Feather name="edit-3" size={14} color={palette.cyanInk} /><Text style={[styles.editText, { color: palette.cyanInk }]}>수정</Text>
        </Pressable>}
      </View>
    </View>
  </View>;
}
export default memo(ChatBubble);
const styles = StyleSheet.create({
  row: { minWidth: 0, marginBottom: 14, gap: 5 },
  speaker: { fontSize: 12, lineHeight: 20, fontWeight: '500', paddingHorizontal: 3 },
  bubble: { minWidth: 0, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  message: { fontSize: 16, lineHeight: 26 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingTop: 6 },
  time: { fontSize: 11, lineHeight: 18 },
  edit: { minHeight: 44, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 10 },
  editText: { fontSize: 12, lineHeight: 20, fontWeight: '500' },
});
