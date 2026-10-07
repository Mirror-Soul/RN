import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { NoticeType } from './noticePresentation';

/** One opaque surface; message, icon and dismiss each own their layout space. */
export function NoticeCard({ message, type, maxHeight, onDismiss, onRead }: {
  message: string; type: NoticeType; maxHeight: number; onDismiss: () => void; onRead: () => void;
}) {
  const { colors } = useThemeColors();
  const [textHeight, setTextHeight] = useState(44);
  const padding = Math.max(0, Math.min(12, Math.floor((maxHeight - 46) / 2)));
  const messageLimit = Math.max(44, maxHeight - padding * 2 - 2);
  const ink = type === 'error' ? colors.state.danger : type === 'success' ? colors.state.success : colors.text.secondary;
  const icon = type === 'error' ? 'alert-circle' : type === 'success' ? 'check-circle' : 'info';
  return <View testID="notice-card" onTouchStart={onRead} style={[styles.card, { padding, minHeight: 46 + padding * 2, backgroundColor: colors.background.elevated, borderColor: colors.border.primary }]}>
    <View style={styles.icon}><Feather name={icon} size={20} color={ink} allowFontScaling={false} /></View>
    <ScrollView style={[styles.scroll, { height: Math.min(Math.max(22, textHeight), messageLimit) }]}
      contentContainerStyle={styles.messageContent} onContentSizeChange={(_width, height) => setTextHeight(height)} onScrollBeginDrag={onRead}
      keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.message, { color: colors.text.primary }]}>{message}</Text>
    </ScrollView>
    <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="알림 닫기" hitSlop={2} style={styles.close}>
      <Feather name="x" size={18} color={colors.text.secondary} allowFontScaling={false} />
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  card: { alignSelf: 'stretch', minHeight: 68, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderWidth: 1, borderRadius: 18,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 8 },
  icon: { flexShrink: 0, width: 24, alignItems: 'center' },
  scroll: { flex: 1, minWidth: 0 }, messageContent: { flexGrow: 0 },
  message: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  close: { width: 44, height: 44, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
});
