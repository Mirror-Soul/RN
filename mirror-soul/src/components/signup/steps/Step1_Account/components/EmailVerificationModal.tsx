import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { VerificationModalProps } from '../types/step1';

export default function EmailVerificationModal({ isVisible, email, onClose, onVerify, timeLeft = 180, formattedTime = '03:00', onResend, isLoading = false }: VerificationModalProps) {
  const { colors, isDark } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();
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
  const blocked = verifying || isLoading;
  const validCode = /^\d{6}$/.test(code);
  const foreground = isDark ? Colors.primary.soulBlack : Colors.neutral.pureWhite;
  const confirm = async () => {
    if (!isVisible || lock.current || blocked || !validCode || timeLeft <= 0) return;
    const session = generation.current;
    lock.current = true;
    setVerifying(true);
    try {
      const success = await onVerify(code);
      if (!mounted.current || session !== generation.current) return;
      if (success) onClose();
      else setError('코드가 맞지 않거나 확인하지 못했어요. 다시 확인해주세요.');
    } catch (failure) {
      if (mounted.current && session === generation.current) setError(getErrorDisplayMessage(failure, '인증을 확인하지 못했어요. 다시 시도해주세요.'));
    } finally {
      if (mounted.current && session === generation.current) { lock.current = false; setVerifying(false); }
    }
  };
  return <Modal transparent visible={isVisible} animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={[styles.overlay, { backgroundColor: colors.background.overlay }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
        <View style={[contentContainerStyle, styles.frame, { paddingHorizontal: screenPadding }]}>
          <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.heading}>
                <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>이메일을 확인할게요</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="인증 창 닫기" onPress={onClose} style={styles.close}><Feather name="x" size={22} color={colors.text.secondary} /></Pressable>
              </View>
              <Text style={[styles.email, { color: colors.text.primary }]}>{email}</Text>
              <Text style={[styles.copy, { color: colors.text.secondary }]}>{isLoading && !verifying ? '인증 코드를 보내고 있어요…' : '이메일로 받은 숫자 6자리를 입력해주세요. 메일이 없다면 스팸함도 확인해주세요.'}</Text>
              <View style={styles.labelRow}>
                <Text style={[styles.copy, { color: colors.text.primary }]}>인증 코드</Text>
                <Text style={[styles.copy, { color: timeLeft > 0 ? colors.brand.accent : colors.state.danger }]}>{timeLeft > 0 ? formattedTime : '시간 만료'}</Text>
              </View>
              <TextInput accessibilityLabel="이메일 인증 코드 6자리" value={code} onChangeText={text => { setCode(text.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                placeholder="6자리 숫자" placeholderTextColor={colors.text.muted} keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" autoFocus={isVisible}
                editable={!blocked && timeLeft > 0} style={[styles.input, { color: colors.text.primary, borderColor: error ? colors.state.danger : colors.border.strong, backgroundColor: colors.background.glass }]} />
              {!!error && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{error}</Text>}
              {timeLeft <= 0 && <Text style={[styles.copy, { color: colors.text.secondary }]}>입력 시간이 지났어요. 코드를 다시 받아주세요.</Text>}
              <Pressable accessibilityRole="button" accessibilityLabel={timeLeft <= 0 ? '인증 코드 다시 받기' : '이메일 인증하기'} accessibilityState={{ disabled: blocked || (timeLeft > 0 ? !validCode : !onResend), busy: blocked }}
                disabled={blocked || (timeLeft > 0 ? !validCode : !onResend)} onPress={() => timeLeft <= 0 ? onResend?.() : void confirm()}
                style={[styles.primary, { backgroundColor: colors.brand.accent, opacity: blocked || (timeLeft > 0 && !validCode) ? 0.45 : 1 }]}>
                {blocked ? <ActivityIndicator color={foreground} /> : <Text style={[styles.buttonText, { color: foreground }]}>{timeLeft <= 0 ? '코드 다시 받기' : '이메일 인증하기'}</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1 },
  keyboard: { flex: 1, justifyContent: 'center' },
  frame: { maxHeight: '100%' },
  card: { maxHeight: '100%', borderWidth: 1, borderRadius: Radii.xl, overflow: 'hidden' },
  content: { padding: Spacing.xl, gap: Spacing.lg },
  heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, lineHeight: 30 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  email: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 24 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  labelRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.sm },
  input: { minHeight: 56, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, fontSize: FontSize.xxl, textAlign: 'center', letterSpacing: 3 },
  primary: { minHeight: 52, padding: Spacing.md, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, textAlign: 'center' },
});
