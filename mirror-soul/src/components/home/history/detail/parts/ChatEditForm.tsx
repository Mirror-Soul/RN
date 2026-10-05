import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';

export default function ChatEditForm({ onSave, onCancel, disabled = false, saving = false }: {
  onSave: () => void; onCancel: () => void; disabled?: boolean; saving?: boolean;
}) {
  const { colors, palette } = useMatchingDesign();
  const { fontScale } = useWindowDimensions();
  return <View style={[styles.actions, fontScale > 1.8 && styles.stacked]}>
    <Pressable onPress={onCancel} disabled={saving} accessibilityRole="button" accessibilityLabel="답변 수정 취소" accessibilityState={{ disabled: saving }} style={[styles.button, styles.cancel, { borderColor: colors.border.primary, opacity: saving ? 0.5 : 1 }]}><Text style={[styles.text, { color: colors.text.secondary }]}>취소</Text></Pressable>
    <Pressable onPress={onSave} disabled={disabled || saving} accessibilityRole="button" accessibilityLabel="수정한 답변 저장" accessibilityState={{ disabled: disabled || saving, busy: saving }} style={[styles.button, styles.save, { backgroundColor: palette.buttonBase, opacity: disabled || saving ? 0.5 : 1 }]}>
      {saving ? <ActivityIndicator color={palette.onAccent} /> : <Text style={[styles.text, { color: palette.onAccent }]}>저장하기</Text>}
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10 },
  stacked: { flexDirection: 'column' },
  button: { minWidth: 0, minHeight: 48, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  cancel: { flexGrow: 1, borderWidth: 1 },
  save: { flexGrow: 2 },
  text: { fontSize: 15, lineHeight: 23, fontWeight: '600' },
});
