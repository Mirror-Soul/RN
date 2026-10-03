import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';
import { useKeyboardVisible } from '@/src/hooks/useKeyboardVisible';
import { useSignupFieldColors } from '@/src/components/signup/common/useSignupFieldColors';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { VerificationModalProps } from '../types/step1';

const ACCESSORY_ID = 'signup-verification-done';

export default function EmailVerificationModal({ isVisible, email, onClose, onVerify, timeLeft = 180, formattedTime = '03:00', onResend, isLoading = false }: VerificationModalProps) {
  const { colors, isDark } = useThemeColors();
  const fieldColors = useSignupFieldColors();
  const { contentContainerStyle } = useLayout();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const input = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    generation.current += 1;
    lock.current = false;
    setVerifying(false);
    setCode('');
    setError('');
  }, [isVisible, email]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current += 1; };
  }, []);
  const dismissKeyboard = () => { input.current?.blur(); Keyboard.dismiss(); };
  const close = () => { dismissKeyboard(); onClose(); };
  const blocked = verifying || isLoading;
  const validCode = /^\d{6}$/.test(code);
  const foreground = isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite;
  const confirm = async () => {
    if (!isVisible || lock.current || blocked || !validCode || timeLeft <= 0) return;
    const session = generation.current;
    lock.current = true;
    dismissKeyboard();
    setVerifying(true);
    try {
      const success = await onVerify(code);
      if (!mounted.current || session !== generation.current) return;
      if (success) close();
      else setError('인증을 확인하지 못했어요. 코드를 확인한 뒤 다시 시도해주세요.');
    } catch (failure) {
      if (mounted.current && session === generation.current) setError(getErrorDisplayMessage(failure, '인증을 확인하지 못했어요. 다시 시도해주세요.'));
    } finally {
      if (mounted.current && session === generation.current) { lock.current = false; setVerifying(false); }
    }
  };
  const changeCode = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError('');
    // Number-pad has no Return key. Finishing the code must reveal the next action.
    if (digits.length === 6) dismissKeyboard();
  };
  const resend = () => {
    if (blocked || !onResend) return;
    dismissKeyboard();
    setCode('');
    setError('');
    onResend();
  };
  const buttonDisabled = blocked || (timeLeft > 0 ? !validCode : !onResend);
  return <Modal transparent visible={isVisible} animationType="fade" presentationStyle="overFullScreen" onRequestClose={close}>
    <View style={[styles.overlay, { backgroundColor: colors.background.overlay }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="이메일 인증창 닫기" onPress={close} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView enabled={Platform.OS === 'ios'} behavior="padding" style={styles.keyboard} pointerEvents="box-none">
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea} pointerEvents="box-none">
          <View style={[contentContainerStyle, styles.sheet, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            <View style={[styles.handle, { backgroundColor: fieldColors.border }]} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
              automaticallyAdjustContentInsets={false} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
              <View style={styles.heading}>
                <View style={styles.headingText}>
                  <Text style={[styles.eyebrow, { color: colors.brand.accent }]}>이메일 인증</Text>
                  <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>받은 코드를 입력해주세요</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="인증 창 닫기" onPress={close} style={styles.close}>
                  <Feather name="x" size={22} color={fieldColors.label} />
                </Pressable>
              </View>
              <View style={[styles.recipient, { backgroundColor: fieldColors.inputBackground }]}>
                <Feather name="mail" size={18} color={colors.brand.accent} />
                <Text style={[styles.email, { color: fieldColors.label }]}>{email}</Text>
              </View>
              <Text accessibilityLiveRegion="polite" style={[styles.copy, { color: fieldColors.hint }]}>
                {isLoading && !verifying ? '인증 코드를 보내고 있어요…' : '이메일로 받은 숫자 6자리를 입력하면 돼요.'}
              </Text>
              <View style={styles.codeGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.copy, { color: fieldColors.label }]}>인증 코드</Text>
                  <Text style={[styles.timer, { color: timeLeft > 0 ? colors.brand.accent : colors.state.danger, backgroundColor: fieldColors.inputBackground }]}>
                    {timeLeft > 0 ? '남은 시간 ' + formattedTime : '시간 만료'}
                  </Text>
                </View>
                <TextInput ref={input} accessibilityLabel="이메일 인증 코드 6자리" value={code} onChangeText={changeCode}
                  placeholder="6자리 숫자" placeholderTextColor={fieldColors.placeholder} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code"
                  inputAccessoryViewID={Platform.OS === 'ios' ? ACCESSORY_ID : undefined} returnKeyType="done" onSubmitEditing={() => void confirm()}
                  editable={!blocked && timeLeft > 0} style={[styles.input, { color: colors.text.primary, borderColor: error ? colors.state.danger : validCode ? colors.brand.accent : fieldColors.border, backgroundColor: fieldColors.inputBackground }]} />
                {!!error && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{error}</Text>}
                {validCode && !error && <Text style={[styles.copy, { color: colors.state.success }]}>입력을 마쳤어요. 아래 버튼으로 인증해주세요.</Text>}
                {timeLeft <= 0 && <Text style={[styles.copy, { color: fieldColors.hint }]}>입력 시간이 지났어요. 새 코드를 받아주세요.</Text>}
              </View>
              <Text style={[styles.help, { color: fieldColors.hint }]}>메일이 보이지 않나요? 스팸함도 확인해주세요.</Text>
            </ScrollView>
            <View style={[styles.footer, { borderColor: colors.border.primary, paddingBottom: Spacing.lg + (keyboardVisible ? 0 : insets.bottom) }]}>
              <Pressable accessibilityRole="button" accessibilityLabel={timeLeft <= 0 ? '인증 코드 다시 받기' : '이메일 인증하기'} accessibilityState={{ disabled: buttonDisabled, busy: blocked }}
                disabled={buttonDisabled} onPress={() => timeLeft <= 0 ? resend() : void confirm()}
                style={[styles.primary, { backgroundColor: colors.brand.accent, opacity: buttonDisabled ? 0.45 : 1 }]}>
                {blocked ? <ActivityIndicator color={foreground} /> : <Text style={[styles.buttonText, { color: foreground }]}>{timeLeft <= 0 ? '새 코드 받기' : '인증하고 계속'}</Text>}
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
      {Platform.OS === 'ios' && <InputAccessoryView nativeID={ACCESSORY_ID} backgroundColor={colors.background.elevated}>
        <View style={styles.accessory}>
          <Pressable accessibilityRole="button" accessibilityLabel="인증 코드 키보드 닫기" onPress={dismissKeyboard} style={styles.done}>
            <Text style={[styles.copy, { color: colors.brand.accent }]}>입력 완료</Text>
          </Pressable>
        </View>
      </InputAccessoryView>}
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  keyboard: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '100%', flexShrink: 1, borderTopWidth: 1, borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, overflow: 'hidden' },
  handle: { width: 36, height: 4, borderRadius: Radii.full, alignSelf: 'center', marginTop: Spacing.md },
  scroll: { flexGrow: 0, flexShrink: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg },
  heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headingText: { flex: 1, gap: Spacing.xs },
  eyebrow: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22 },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, lineHeight: 30 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  recipient: { borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  email: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  codeGroup: { gap: Spacing.sm },
  labelRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  timer: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radii.sm },
  input: { minHeight: 64, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, textAlign: 'center', letterSpacing: 3 },
  help: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
  footer: { borderTopWidth: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  primary: { minHeight: 52, padding: Spacing.md, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, textAlign: 'center' },
  accessory: { alignItems: 'flex-end', paddingHorizontal: Spacing.lg },
  done: { minHeight: 44, paddingHorizontal: Spacing.md, justifyContent: 'center' },
});
