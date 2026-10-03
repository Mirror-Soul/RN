import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, InputAccessoryView, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useKeyboardVisible } from '@/src/hooks/useKeyboardVisible';

export const SIGNUP_KEYBOARD_ACCESSORY_ID = 'signup-input-done';

interface Props {
  children: React.ReactNode;
  title: string;
  hint: string;
  disabled: boolean;
  isSubmitting: boolean;
  submittingLabel: string;
  onContinue: () => void;
  scrollEnabled?: boolean;
}

export default function SignupFormScreen({ children, title, hint, disabled, isSubmitting, submittingLabel, onContinue, scrollEnabled = true }: Props) {
  const { colors, isDark } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();
  const keyboardVisible = useKeyboardVisible();
  const blocked = disabled || isSubmitting;
  const foreground = isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite;
  return <View style={styles.screen}>
    {/* iOS measures the focused field natively; Android's window already uses adjustResize. */}
    <ScrollView scrollEnabled={scrollEnabled} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'} automaticallyAdjustContentInsets={false} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
      <View style={[contentContainerStyle, styles.content, { paddingHorizontal: screenPadding }]}>
        <View pointerEvents={isSubmitting ? 'none' : 'auto'} style={styles.fields}>{children}</View>
      </View>
    </ScrollView>
    {!keyboardVisible && <View style={[styles.footer, { borderColor: colors.border.primary, backgroundColor: colors.background.primary }]}>
      <View style={[contentContainerStyle, styles.footerContent, { paddingHorizontal: screenPadding }]}>
        <Text style={[styles.hint, { color: colors.text.secondary }]}>{isSubmitting ? submittingLabel : hint}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: blocked, busy: isSubmitting }} disabled={blocked}
          onPress={() => { Keyboard.dismiss(); onContinue(); }}
          style={[styles.button, { backgroundColor: colors.brand.accent, opacity: blocked ? 0.45 : 1 }]}>
          {isSubmitting ? <ActivityIndicator color={foreground} /> : <>
            <Text style={[styles.buttonText, { color: foreground }]}>{title}</Text>
            <Feather name="arrow-right" size={19} color={foreground} />
          </>}
        </Pressable>
      </View>
    </View>}
    {Platform.OS === 'ios' && <InputAccessoryView nativeID={SIGNUP_KEYBOARD_ACCESSORY_ID} backgroundColor={colors.background.elevated}>
      <View style={[styles.accessory, { borderColor: colors.border.primary }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="키보드 닫기" onPress={() => Keyboard.dismiss()} style={styles.done}>
          <Text style={[styles.doneText, { color: colors.brand.accent }]}>입력 완료</Text>
        </Pressable>
      </View>
    </InputAccessoryView>}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, gap: Spacing.xxl },
  fields: { gap: Spacing.xxl },
  footer: { borderTopWidth: 1, paddingVertical: Spacing.md },
  footerContent: { gap: Spacing.sm },
  hint: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 21 },
  button: { minHeight: 56, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, borderRadius: Radii.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  buttonText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, textAlign: 'center', flexShrink: 1 },
  accessory: { borderTopWidth: 1, alignItems: 'flex-end', paddingHorizontal: Spacing.lg },
  done: { minHeight: 44, paddingHorizontal: Spacing.md, justifyContent: 'center' },
  doneText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24 },
});
