import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FontFamily } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';
import { useIntroductionQuery } from '@/src/features/profile/hooks/useIntroductionQuery';
import { useProfileRefresh } from '@/src/features/profile/hooks/useProfileRefresh';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { JOB_LABEL } from '@/src/constants/jobLabels';
import { useJobReviewQuery } from './useJobReviewQuery';
import { jobReviewCopy } from './jobReviewState';
import { EvidencePicker } from './EvidencePicker';
import { submitEvidenceDraft, useEvidenceDraft } from './evidenceDraft';

export function JobVerificationForm({ onClose }: { onClose: () => void }) {
  const { colors } = useThemeColors(); const insets = useSafeAreaInsets();
  const { contentContainerStyle } = useLayout();
  const owner = useAuthStore(s => s.userUuid);
  const profile = useIntroductionQuery(); const review = useJobReviewQuery();
  const draft = useEvidenceDraft(); const { showToast } = useToast();
  const { refetch: refetchReview } = review; const { refetch: refetchProfile } = profile;
  const refresh = useCallback(() => Promise.allSettled([refetchReview(), refetchProfile()]), [refetchReview, refetchProfile]);
  useProfileRefresh(refresh);
  const state = review.data ? jobReviewCopy(review.data) : null;
  const canSubmit = !!state?.canSubmit && !review.isError && !!profile.data?.job && !profile.isError;
  const photos = draft.owner === owner && draft.job === profile.data?.job ? draft.photos : [];
  const invalidPreview = photos.some(photo => photo.previewFailed);
  const submit = async () => {
    if (!canSubmit || draft.busy || !photos.length || invalidPreview) return;
    try {
      await submitEvidenceDraft();
      if (useAuthStore.getState().userUuid !== owner) return;
      showToast('직업 서류 심사를 접수했어요.', 'success');
      void refresh();
    } catch (error) {
      if (useAuthStore.getState().userUuid !== owner) return;
      if (getErrorCode(error) === 'JOB_VERIFICATION_ALREADY_PENDING') void refresh();
      useEvidenceDraft.setState({ error: getErrorDisplayMessage(error, '사진은 그대로 있어요. 다시 제출해 주세요.') });
    }
  };
  return <View style={styles.screen}>
    <View style={[styles.header, contentContainerStyle, { paddingLeft: 20 + insets.left, paddingRight: 12 + insets.right }]}><Text accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>직업 서류 확인</Text>
      <Pressable disabled={draft.busy} onPress={onClose} accessibilityRole="button" accessibilityLabel="직업 서류 확인 닫기" style={styles.iconButton}><Feather name="x" size={22} color={colors.text.secondary} /></Pressable>
    </View>
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.body, contentContainerStyle, { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right }]}>
      {review.isLoading || profile.isLoading ? <View style={styles.notice}><ActivityIndicator color={colors.brand.accent} /><Text style={[styles.copy, { color: colors.text.secondary }]}>현재 신청 상태를 확인하고 있어요.</Text></View>
        : review.isError || profile.isError || !state ? <View style={[styles.notice, { backgroundColor: colors.background.glass }]}><Text accessibilityRole="alert" style={[styles.copy, { color: colors.text.primary }]}>신청 상태를 불러오지 못했어요.</Text><Pressable disabled={review.isFetching || profile.isFetching} onPress={() => { void refresh(); }} accessibilityRole="button" style={styles.link}><Text style={[styles.copy, { color: colors.brand.accent }]}>다시 확인하기</Text></Pressable></View>
        : <View style={[styles.notice, { backgroundColor: colors.background.glass }]}>
          <Text style={[styles.status, { color: colors.text.primary }]}>{state.title}</Text><Text style={[styles.copy, { color: colors.text.secondary }]}>{state.copy}</Text>
          {profile.data?.job && <Text style={[styles.copy, { color: colors.text.primary }]}>현재 직군 · {JOB_LABEL[profile.data.job]}</Text>}
          {review.data?.claimedJob && !review.data.appliesToCurrentJob && <Text style={[styles.copy, { color: colors.text.secondary }]}>신청한 직군 · {JOB_LABEL[review.data.claimedJob]}</Text>}
          {review.data?.status === 'REJECTED' && !!review.data.rejectionReason && <View style={styles.reason}><Text style={[styles.caption, { color: colors.text.secondary }]}>보완이 필요한 이유</Text><Text selectable style={[styles.copy, { color: colors.text.primary }]}>{review.data.rejectionReason}</Text></View>}
          {!state.canSubmit && <Pressable disabled={review.isFetching} onPress={() => { void review.refetch(); }} accessibilityRole="button" style={styles.link}><Text style={[styles.copy, { color: colors.brand.accent }]}>{review.isFetching ? '확인 중…' : '최신 결과 확인'}</Text></Pressable>}
        </View>}
      {canSubmit && <><EvidencePicker job={profile.data?.job ?? null} /><Text style={[styles.caption, { color: colors.text.secondary }]}>사진은 담당자의 서류 확인에 사용되며 다른 회원에게 공개되지 않아요. 앱을 닫거나 로그아웃하면 제출 전 사진을 다시 선택해야 할 수 있어요.</Text></>}
      {state && !state.canSubmit && draft.error && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{draft.error}</Text>}
      <View style={styles.scope}><Text style={[styles.caption, { color: colors.text.secondary }]}>‘직업 서류 확인’은 제출 자료를 확인했다는 뜻이에요. PASS 본인확인 및 서류 명의 대조와는 별개예요.</Text></View>
    </ScrollView>
    <View style={[styles.footer, contentContainerStyle, { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right, paddingBottom: Math.max(insets.bottom, 12) }]}>
      {canSubmit ? <Pressable onPress={() => { void submit(); }} disabled={draft.busy || !photos.length || invalidPreview} accessibilityRole="button" accessibilityState={{ disabled: draft.busy || !photos.length || invalidPreview, busy: draft.busy }} style={[styles.submit, { backgroundColor: colors.brand.accent, opacity: draft.busy || !photos.length || invalidPreview ? 0.5 : 1 }]}><Text style={[styles.buttonText, { color: colors.background.primary }]}>{draft.busy ? draft.phase : review.data?.status === 'REJECTED' ? '보완한 서류 제출' : '서류 제출'}</Text></Pressable>
        : <Pressable onPress={onClose} disabled={draft.busy} accessibilityRole="button" style={[styles.submit, { backgroundColor: colors.background.glass }]}><Text style={[styles.buttonText, { color: colors.text.primary }]}>닫기</Text></Pressable>}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 }, header: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  title: { flex: 1, minWidth: 0, fontFamily: FontFamily.sans, fontSize: 22, lineHeight: 30, fontWeight: '600' }, iconButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  body: { gap: 14, paddingTop: 8, paddingBottom: 18, width: '100%' }, notice: { padding: 14, borderRadius: 14, gap: 8 }, status: { fontFamily: FontFamily.sans, fontSize: 17, lineHeight: 25, fontWeight: '600' },
  copy: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 23 }, caption: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 20 }, reason: { gap: 4, marginTop: 4 }, scope: { paddingHorizontal: 2 }, link: { minHeight: 44, justifyContent: 'center' },
  footer: { width: '100%', paddingTop: 10 }, submit: { minHeight: 50, padding: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, buttonText: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 23, fontWeight: '600' },
});
