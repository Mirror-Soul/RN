import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { TIME_REFILL_TERMS_DRAFT as draft } from '../constants/timeRefillTerms';

/** Scroll host is owned by the sheet, so terms never open a second native modal. */
export function TimeRefillTerms() {
  const { colors, palette } = useMatchingDesign();
  const { showToast } = useToast();
  return <View style={styles.container}>
    <View style={[styles.notice, { backgroundColor: palette.tint }]}>
      <Text style={[styles.version, { color: palette.accentInk }]}>{draft.version}</Text>
      <Text style={[styles.body, { color: colors.text.primary }]}>{draft.notice}</Text>
    </View>
    <Text style={[styles.title, { color: colors.text.primary }]}>확정이 필요한 운영 정책</Text>
    <Text style={[styles.body, { color: colors.text.secondary }]}>{draft.unresolved}</Text>
    {draft.articles.map(article => <View key={article.title} style={styles.article}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>{article.title}</Text>
      <Text style={[styles.body, { color: colors.text.secondary }]}>{article.body}</Text>
      {'basis' in article && <Text style={[styles.basis, { color: colors.text.muted }]}>{article.basis}</Text>}
    </View>)}
    <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>법령과 공식 안내 확인</Text>
    {draft.sources.map(source => <Pressable key={source.url} accessibilityRole="link" onPress={() => {
      void Linking.openURL(source.url).catch(() => showToast('법령 페이지를 열지 못했어요. 잠시 후 다시 시도해주세요.', 'error'));
    }} style={({ pressed }) => [styles.source, { borderColor: colors.border.primary, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[styles.body, { color: palette.cyanInk }]}>{source.title}</Text>
    </Pressable>)}
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 12 },
  notice: { padding: 16, borderRadius: 16, gap: 8 },
  version: { fontSize: 13, lineHeight: 20, fontWeight: '600' },
  title: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 23 },
  article: { gap: 8, marginTop: 8 },
  basis: { fontSize: 12, lineHeight: 19 },
  source: { minHeight: 48, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
