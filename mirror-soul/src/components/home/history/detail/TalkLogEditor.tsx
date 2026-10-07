import React from 'react';
import { isLoaded } from 'expo-font';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { BrowseFontFamily } from '@/src/constants/browseFonts';
import { FontFamily } from '@/src/constants/theme';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { useLayout } from '@/src/hooks/useLayout';
import ChatEditForm from './parts/ChatEditForm';

/** Separate editor prevents a recycled transcript row from owning the keyboard and save controls. */
export default function TalkLogEditor({ text, saving, failed, visible = true, onDismiss, onChange, onSave, onCancel }: {
  text: string; saving: boolean; failed: boolean; visible?: boolean; onDismiss?: () => void;
  onChange: (text: string) => void; onSave: () => void; onCancel: () => void;
}) {
  const { colors, palette } = useMatchingDesign();
  const { contentContainerStyle } = useLayout();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const inputHeight = Math.max(128, Math.min(320, height * 0.35));
  const empty = text.trim().length === 0;
  const tooLong = text.length > 2000;
  return <Modal visible={visible} presentationStyle="fullScreen" statusBarTranslucent navigationBarTranslucent animationType="none" onDismiss={onDismiss} onRequestClose={onCancel}>
    <KeyboardAvoidingView style={[styles.screen, { backgroundColor: colors.background.primary }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, contentContainerStyle, { paddingTop: insets.top + 8, paddingLeft: insets.left + 16, paddingRight: insets.right + 16 }]}>
        <Text accessibilityRole="header" variant="heading" numberOfLines={1} style={[styles.title, { color: colors.text.primary }]}>내 AI 트윈 답변 수정</Text>
        <Pressable onPress={onCancel} disabled={saving} accessibilityRole="button" accessibilityLabel="답변 수정 닫기" accessibilityState={{ disabled: saving }} style={styles.close}><Feather name="x" size={22} color={colors.text.secondary} /></Pressable>
      </View>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[styles.body, contentContainerStyle, { paddingLeft: insets.left + 20, paddingRight: insets.right + 20 }]}>
        <Text style={[styles.note, { color: colors.text.secondary }]}>의도와 다르게 말한 부분을 고쳐보세요.{ '\n' }변경한 내용은 이 대화 기록에 저장돼요.</Text>
        <TextInput autoFocus multiline scrollEnabled value={text} editable={!saving} onChangeText={onChange} maxLength={Math.max(2000, text.length)}
          accessibilityLabel="내 AI 트윈 답변 내용" accessibilityHint="최대 2000자. 수정한 문장을 입력하세요."
          textAlignVertical="top"
          style={[styles.input, { height: inputHeight, fontFamily: isLoaded(BrowseFontFamily.regular) ? BrowseFontFamily.regular : FontFamily.sans, borderColor: palette.buttonBorder, backgroundColor: colors.background.card, color: colors.text.primary }]} />
        <Text style={[styles.count, { color: tooLong ? colors.state.danger : colors.text.muted }]}>{text.length.toLocaleString()} / 2,000자</Text>
        {empty && <Text accessibilityRole="alert" style={[styles.note, { color: colors.text.secondary }]}>답변 내용을 입력해 주세요.</Text>}
        {tooLong && <Text accessibilityRole="alert" style={[styles.note, { color: colors.state.danger }]}>2,000자 이하로 줄여주세요.</Text>}
        {failed && <Text accessibilityRole="alert" style={[styles.note, { color: colors.state.danger }]}>저장하지 못했어요. 작성한 내용은 그대로 있으니 다시 시도해 주세요.</Text>}
        <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom), borderColor: colors.border.primary }]}>
          <ChatEditForm onCancel={onCancel} onSave={onSave} disabled={empty || tooLong} saving={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </Modal>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 8 },
  title: { flex: 1, minWidth: 0, fontSize: 18, lineHeight: 27, fontWeight: '600' },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  body: { paddingVertical: 14, gap: 12 },
  note: { fontSize: 14, lineHeight: 23 },
  input: { fontSize: 16, lineHeight: 26, padding: 14, borderWidth: 1, borderRadius: 14, width: '100%' },
  count: { fontSize: 12, lineHeight: 20, textAlign: 'right' },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
});
