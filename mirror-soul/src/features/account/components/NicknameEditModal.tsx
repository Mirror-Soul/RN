import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useAccountInfoQuery } from '../hooks/useAccountInfoQuery';
import { useModifyNicknameMutation } from '../hooks/useModifyNicknameMutation';

const nicknameSchema = z.object({ nickname: z.string().min(2, '2자 이상 입력해 주세요.').max(10, '10자 이하로 입력해 주세요.').regex(/^[가-힣a-zA-Z0-9]+$/, '한글·영문·숫자만 사용할 수 있어요.') });
type FormData = z.infer<typeof nicknameSchema>;

export const NicknameEditModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const { data } = useAccountInfoQuery();
  const mutation = useModifyNicknameMutation();
  const { showToast } = useToast();
  const original = useRef(data?.name ?? '');
  const formUser = useRef(useAuthStore.getState().userUuid);
  const wasOpen = useRef(false);
  const alive = useRef(true);
  const lock = useRef(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({ resolver: zodResolver(nicknameSchema), defaultValues: { nickname: original.current }, mode: 'onChange' });
  const value = watch('nickname');
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      original.current = data?.name ?? '';
      formUser.current = useAuthStore.getState().userUuid;
      reset({ nickname: original.current });
      setSaveError(null);
    }
    wasOpen.current = isOpen;
  }, [isOpen, data?.name, reset]);
  const close = () => { if (!lock.current) { Keyboard.dismiss(); onClose(); } };
  const submit = async ({ nickname }: FormData) => {
    if (lock.current || nickname === original.current) return;
    const session = useAuthStore.getState();
    if (!session.isLoggedIn || !formUser.current || session.userUuid !== formUser.current) { setSaveError('계정이 변경됐어요. 창을 닫고 다시 시도해 주세요.'); return; }
    lock.current = true;
    setSaveError(null);
    Keyboard.dismiss();
    try {
      await mutation.mutateAsync(nickname);
      if (alive.current && useAuthStore.getState().isLoggedIn && useAuthStore.getState().userUuid === formUser.current) { onClose(); showToast('닉네임을 변경했어요.', 'success'); }
    } catch (error) {
      if (alive.current && useAuthStore.getState().userUuid === formUser.current) setSaveError(getErrorDisplayMessage(error, '닉네임을 저장하지 못했어요. 다시 시도해 주세요.'));
    } finally { lock.current = false; }
  };
  const disabled = isSubmitting || !isValid || value === original.current;
  return <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.overlay, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }]}>
      <Pressable disabled={isSubmitting} accessibilityRole="button" accessibilityLabel="닉네임 변경 닫기" onPress={close} style={[StyleSheet.absoluteFill, { backgroundColor: colors.background.overlay }]} />
      <View accessibilityViewIsModal style={[styles.card, { backgroundColor: colors.background.elevated, borderColor: colors.border.primary }]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>닉네임 변경</Text>
          <Text style={[styles.copy, { color: colors.text.secondary }]}>프로필과 대화방에 표시할 이름을 정해요.</Text>
          <Text style={[styles.label, { color: colors.text.primary }]}>새 닉네임</Text>
          <Controller control={control} name="nickname" render={({ field: { onChange, onBlur, value: input } }) => <TextInput accessibilityLabel="새 닉네임" value={input} onChangeText={text => { setSaveError(null); onChange(text); }} onBlur={onBlur} editable={!isSubmitting} autoFocus autoCapitalize="none" autoCorrect={false} maxLength={10} returnKeyType="done" onSubmitEditing={handleSubmit(submit)} style={[styles.input, { color: colors.text.primary, backgroundColor: colors.background.glass, borderColor: errors.nickname || saveError ? colors.state.danger : colors.border.strong }]} />} />
          <View style={styles.hintRow}><Text style={[styles.hint, { color: colors.text.secondary }]}>한글·영문·숫자 2~10자</Text><Text style={[styles.copy, { color: colors.text.secondary }]}>{value.length}/10</Text></View>
          {errors.nickname && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{errors.nickname.message}</Text>}
          {saveError && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{saveError}</Text>}
          <Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel="닉네임 저장" accessibilityState={{ disabled, busy: isSubmitting }} onPress={handleSubmit(submit)} style={[styles.button, { borderColor: colors.brand.accent, backgroundColor: colors.background.glass, opacity: disabled ? 0.5 : 1 }]}>{isSubmitting && <ActivityIndicator color={colors.brand.accent} />}<Text style={[styles.buttonText, { color: colors.brand.accent }]}>{isSubmitting ? '저장 중…' : '변경 내용 저장'}</Text></Pressable>
          <Pressable disabled={isSubmitting} accessibilityRole="button" accessibilityLabel="닉네임 변경 취소" onPress={close} style={styles.cancel}><Text style={[styles.buttonText, { color: colors.text.secondary }]}>취소</Text></Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
};
const styles = StyleSheet.create({
  overlay: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'center', alignItems: 'center' },
  card: { width: '100%', maxWidth: 460, maxHeight: '100%', borderWidth: 1, borderRadius: Radii.xl, overflow: 'hidden' },
  scroll: { flexGrow: 0 },
  content: { padding: Spacing.xl, gap: Spacing.sm },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xxl, fontWeight: FontWeight.semibold, lineHeight: 28 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  label: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22, marginTop: Spacing.md },
  input: { minHeight: 52, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, fontFamily: FontFamily.sans, fontSize: FontSize.lg },
  hintRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  hint: { flex: 1, fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  button: { minHeight: 50, borderWidth: 1, borderRadius: Radii.md, marginTop: Spacing.md, padding: Spacing.md, flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center', alignItems: 'center' },
  buttonText: { flexShrink: 1, fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 24, textAlign: 'center' },
  cancel: { minHeight: 48, justifyContent: 'center', alignItems: 'center', padding: Spacing.sm },
});
