import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface Props {
  visible: boolean;
  canAskAgain: boolean;
  isBusy: boolean;
  error?: string | null;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}
export default function MicPermissionModal({ visible, canAskAgain, isBusy, error, onRequestPermission, onOpenSettings, onClose }: Props) {
  const { colors, isDark } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();
  const { top, bottom } = useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={[styles.overlay, { backgroundColor: colors.background.overlay, paddingHorizontal: screenPadding, paddingTop: top, paddingBottom: bottom }]}>
      <ScrollView style={[contentContainerStyle, styles.scroll]} contentContainerStyle={styles.scrollContent} bounces={false}>
        <View accessibilityViewIsModal style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <Feather name="mic" size={28} color={colors.brand.accent} />
          <Text style={[styles.title, { color: colors.text.primary }]}>내 목소리로 답변하려면</Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>
            마이크와 음성 인식 권한이 필요해요. 말한 내용을 녹음하고 글로 보여드려요.
          </Text>
          {!canAskAgain && <Text style={[styles.description, { color: colors.text.secondary }]}>휴대폰 설정에서 허용한 뒤 돌아와주세요.</Text>}
          {error && <Text accessibilityLiveRegion="polite" style={[styles.description, { color: colors.text.danger }]}>{error}</Text>}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: isBusy, busy: isBusy }} disabled={isBusy}
            onPress={canAskAgain ? onRequestPermission : onOpenSettings} style={[styles.button, { backgroundColor: colors.brand.accent, opacity: isBusy ? 0.5 : 1 }]}>
            {isBusy && <ActivityIndicator color={isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite} />}
            <Text style={[styles.buttonText, { color: isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite }]}>{canAskAgain ? '권한 허용하고 녹음하기' : '휴대폰 설정 열기'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={isBusy} onPress={onClose} style={styles.button}>
            <Text style={[styles.description, { color: colors.text.secondary }]}>지금은 닫기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center' },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingVertical: Spacing.xxl },
  card: { padding: Spacing.xxl, borderWidth: 1, borderRadius: Radii.xl, gap: Spacing.lg },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, lineHeight: 30 },
  description: { fontFamily: FontFamily.sans, fontSize: FontSize.md, lineHeight: 24 },
  button: { minHeight: 48, padding: Spacing.md, borderRadius: Radii.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  buttonText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, flexShrink: 1, textAlign: 'center' },
});
