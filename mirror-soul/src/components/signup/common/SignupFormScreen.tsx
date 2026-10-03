import { Feather } from '@expo/vector-icons';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { SignupLayoutContext } from './SignupLayoutContext';

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
  const fallbackOffset = useContext(SignupLayoutContext);
  const frame = useRef<View>(null);
  const mounted = useRef(true);
  const [measuredOffset, setMeasuredOffset] = useState<number | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const blocked = disabled || isSubmitting;
  const foreground = isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite;
  return <View ref={frame} collapsable={false} style={styles.screen} onLayout={() => frame.current?.measureInWindow((_x, y) => { if (mounted.current) setMeasuredOffset(y); })}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={measuredOffset ?? fallbackOffset} style={styles.screen}>
    <ScrollView scrollEnabled={scrollEnabled} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
      <View style={[contentContainerStyle, styles.content, { paddingHorizontal: screenPadding }]}>
        <View pointerEvents={isSubmitting ? 'none' : 'auto'} style={styles.fields}>{children}</View>
      </View>
    </ScrollView>
    <View style={[styles.footer, { borderColor: colors.border.primary, backgroundColor: colors.background.primary }]}>
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
    </View>
    </KeyboardAvoidingView>
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
});
