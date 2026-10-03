import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';
import { useSignupFieldColors } from '@/src/components/signup/common/useSignupFieldColors';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { VerificationModalProps } from '../types/step1';

const ACCESSORY_ID = 'signup-verification-done';

export default function EmailVerificationModal({ isVisible, email, onClose, onVerify, timeLeft = 180, formattedTime = '03:00', onResend, isLoading = false }: VerificationModalProps) {
  const { colors, isDark } = useThemeColors();
  const fieldColors = useSignupFieldColors();
  const { contentContainerStyle, screenPadding } = useLayout();
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
        <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
          <View testID="email-verification-dialog" style={[contentContainerStyle, styles.frame, { paddingHorizontal: screenPadding }]} pointerEvents="box-none">
            <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
                automaticallyAdjustContentInsets={false} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}>
                <View style={styles.heading}>
                  <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>이메일을 확인할게요</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="인증 창 닫기" onPress={close} style={styles.close}>
                    <Feather name="x" size={22} color={fieldColors.label} />
                  </Pressable>
                </View>
                <Text style={[styles.email, { color: fieldColors.label }]}>{email}</Text>
                <Text accessibilityLiveRegion="polite" style={[styles.copy, { color: fieldColors.hint }]}>
                  {isLoading && !verifying ? '인증 코드를 보내고 있어요…' : '이메일로 받은 숫자 6자리를 입력해주세요. 메일이 없다면 스팸함도 확인해주세요.'}
                </Text>
                <View style={styles.codeGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.copy, { color: fieldColors.label }]}>인증 코드</Text>
                    <Text style={[styles.copy, { color: timeLeft > 0 ? colors.brand.accent : colors.state.danger }]}>{timeLeft > 0 ? formattedTime : '시간 만료'}</Text>
                  </View>
                  <TextInput ref={input} accessibilityLabel="이메일 인증 코드 6자리" value={code} onChangeText={changeCode}
                    placeholder="6자리 숫자" placeholderTextColor={fieldColors.placeholder} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxFontSizeMultiplier={2}
                    inputAccessoryViewID={Platform.OS === 'ios' ? ACCESSORY_ID : undefined} returnKeyType="done" onSubmitEditing={() => void confirm()}
                    editable={!blocked && timeLeft > 0} style={[styles.input, { color: colors.text.primary, borderColor: error ? colors.state.danger : validCode ? colors.brand.accent : fieldColors.border, backgroundColor: fieldColors.inputBackground }]} />
                  {!!error && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{error}</Text>}
                  {timeLeft <= 0 && <Text style={[styles.copy, { color: fieldColors.hint }]}>입력 시간이 지났어요. 코드를 다시 받아주세요.</Text>}
                </View>
              </ScrollView>
              <View style={styles.footer}>
                <Pressable accessibilityRole="button" accessibilityLabel={timeLeft <= 0 ? '인증 코드 다시 받기' : '이메일 인증하기'} accessibilityState={{ disabled: buttonDisabled, busy: blocked }}
                  disabled={buttonDisabled} onPress={() => timeLeft <= 0 ? resend() : void confirm()}
                  style={[styles.primary, { backgroundColor: colors.brand.accent, opacity: buttonDisabled ? 0.45 : 1 }]}>
                  {blocked ? <ActivityIndicator color={foreground} /> : <Text style={[styles.buttonText, { color: foreground }]}>{timeLeft <= 0 ? '코드 다시 받기' : '이메일 인증하기'}</Text>}
                </Pressable>
              </View>
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
  safeArea: { flex: 1, justifyContent: 'center' },
  frame: { maxHeight: '100%', flexShrink: 1, paddingVertical: Spacing.sm },
  card: { maxHeight: '100%', flexShrink: 1, borderWidth: 1, borderRadius: Radii.xl, overflow: 'hidden' },
  scroll: { flexGrow: 0, flexShrink: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg },
  heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, lineHeight: 30 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  email: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 24 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  codeGroup: { gap: Spacing.sm },
  labelRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  input: { minHeight: 56, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, fontFamily: FontFamily.sans, fontSize: FontSize.xxl, textAlign: 'center', letterSpacing: 2 },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  primary: { minHeight: 52, padding: Spacing.md, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, textAlign: 'center' },
  accessory: { alignItems: 'flex-end', paddingHorizontal: Spacing.lg },
  done: { minHeight: 44, paddingHorizontal: Spacing.md, justifyContent: 'center' },
});
