import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';

interface Props {
  visible: boolean;
  title: string;
  description: string;
  action: string;
  cancel?: string;
  busy?: boolean;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** 내용 높이에 맞춰 열고 작은 화면에서는 내부를 스크롤한다. 처리 중에는 닫지 않는다. */
export function AccountActionSheet({ visible, title, description, action, cancel = '취소', busy = false, danger = false, onClose, onConfirm }: Props) {
  const { colors } = useThemeColors();
  const { height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const close = () => { if (!busy) onClose(); };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
    <View style={styles.overlay}>
      <Pressable disabled={busy} accessibilityRole="button" accessibilityLabel={`${title} 닫기`} onPress={close} style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.overlay }]} />
      <View accessibilityViewIsModal style={[styles.sheet, { maxHeight: height * 0.85, backgroundColor: colors.background.elevated }]}>
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <View style={styles.heading}><Feather name={danger ? 'user-minus' : 'log-out'} size={23} color={danger ? colors.state.danger : colors.brand.accent} /><Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>{title}</Text></View>
          <Text style={[styles.copy, { color: colors.text.secondary }]}>{description}</Text>
          <View style={[styles.buttons, fontScale > 1.3 && styles.stacked]}>
            <Pressable disabled={busy} accessibilityRole="button" accessibilityLabel={cancel} onPress={close} style={[styles.button, { borderColor: colors.border.strong, opacity: busy ? 0.6 : 1 }]}><Text style={[styles.buttonText, { color: colors.text.primary }]}>{cancel}</Text></Pressable>
            <Pressable disabled={busy} accessibilityRole="button" accessibilityLabel={action} accessibilityState={{ disabled: busy, busy }} onPress={onConfirm} style={[styles.button, { borderColor: danger ? colors.state.danger : colors.brand.accent, backgroundColor: colors.background.glass, opacity: busy ? 0.6 : 1 }]}>{busy && <ActivityIndicator color={danger ? colors.state.danger : colors.brand.accent} />}<Text style={[styles.buttonText, { color: danger ? colors.state.danger : colors.brand.accent }]}>{busy ? '처리 중…' : action}</Text></Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 560, borderTopLeftRadius: Radii.xxl, borderTopRightRadius: Radii.xxl, overflow: 'hidden' },
  scroll: { flexGrow: 0 },
  content: { padding: Spacing.xl, gap: Spacing.lg },
  heading: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  title: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, lineHeight: 28 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 23 },
  buttons: { flexDirection: 'row', gap: Spacing.md },
  stacked: { flexDirection: 'column' },
  button: { flexGrow: 1, flexBasis: 0, minHeight: 50, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', alignItems: 'center' },
  buttonText: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 24, textAlign: 'center' },
});
