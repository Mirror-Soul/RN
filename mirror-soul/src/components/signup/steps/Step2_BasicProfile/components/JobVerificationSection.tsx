import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import FormLabel from '@/src/components/signup/common/FormLabel';
import StepSelectDropdown from '@/src/components/signup/common/StepSelectDropdown';
import { useDropdownAnchor } from '@/src/components/signup/common/useDropdownAnchor';
import { FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { EvidencePicker } from '@/src/features/job-verification/EvidencePicker';
import { syncEvidenceDraft, useEvidenceDraft } from '@/src/features/job-verification/evidenceDraft';
import type { JobEnum } from '@/src/types/api/onboarding';
import JobCategoryDropdown from '../Professional/JobCategoryDropdown';
import { SectionProps } from '../types/step2';
import { jobCategories } from '../Professional/jobData';
import { SIGNUP_KEYBOARD_ACCESSORY_ID } from '@/src/components/signup/common/SignupFormScreen';

export default function JobVerificationSection({ state, onChange, disabled = false }: SectionProps & { disabled?: boolean }) {
  const { colors } = useThemeColors(); const owner = useAuthStore(s => s.userUuid);
  const [isOpen, setIsOpen] = useState(false); const [expanded, setExpanded] = useState(false);
  const draft = useEvidenceDraft();
  const { triggerRef, anchor, measureAndOpen } = useDropdownAnchor();
  const blocked = disabled || draft.busy;
  const job = jobCategories.some(j => j.value === state.jobCategory) ? state.jobCategory as JobEnum : null;
  const count = draft.owner === owner && draft.job === job ? draft.photos.length : 0;
  return <View style={styles.container}>
    <FormLabel label="직군" optional={false} />
    <View ref={triggerRef}><StepSelectDropdown label="" placeholder={jobCategories.find(j => j.value === job)?.label || '가까운 직군을 선택해주세요'} hasValue={!!job} disabled={blocked} isOpen={isOpen} onPress={() => isOpen ? setIsOpen(false) : measureAndOpen(() => setIsOpen(true))} /></View>
    {isOpen && anchor && <JobCategoryDropdown anchor={anchor} onSelect={value => { if (value !== job && jobCategories.some(item => item.value === value)) { syncEvidenceDraft(owner, value as JobEnum); onChange({ jobCategory: value }); } setIsOpen(false); }} onClose={() => setIsOpen(false)} />}
    <FormLabel label="하는 일 한 줄" optional />
    <TextInput editable={!blocked} accessibilityLabel="하는 일 한 줄, 선택" style={[styles.input, { color: colors.text.primary, borderColor: colors.border.primary, backgroundColor: colors.background.glass }]} value={state.jobTitle}
      inputAccessoryViewID={Platform.OS === 'ios' ? SIGNUP_KEYBOARD_ACCESSORY_ID : undefined} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()} onChangeText={jobTitle => onChange({ jobTitle })} placeholder="예: 작은 브랜드를 디자인해요" placeholderTextColor={colors.text.muted} />
    <View style={[styles.optional, { borderColor: colors.border.primary }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="직업 확인 서류, 선택" accessibilityState={{ expanded: expanded || count > 0, disabled: blocked }} disabled={blocked} onPress={() => setExpanded(value => !value)} style={styles.heading}>
        <View style={{ flex: 1, gap: 3 }}><Text style={[styles.title, { color: colors.text.primary }]}>{count ? `직업 서류 사진 ${count}장 준비됨` : '직업 확인 서류 · 선택'}</Text><Text style={[styles.copy, { color: colors.text.secondary }]}>서류 없이도 가입을 계속할 수 있어요.</Text></View>
        <Feather name={expanded || count > 0 ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.secondary} />
      </Pressable>
      {(expanded || count > 0 || draft.busy) && <View style={styles.details}>
        <EvidencePicker job={job} disabled={disabled} />
        <Text style={[styles.copy, { color: colors.text.secondary }]}>프로필을 저장한 뒤 서류 심사를 접수해요. 담당자가 확인하면 ‘직업 서류 확인’이 표시돼요. 서류 사진은 다른 회원에게 공개되지 않아요.</Text>
        <Text style={[styles.caption, { color: colors.text.secondary }]}>서류 심사와 PASS 본인확인은 별개예요. 지금 첨부한 사진은 앱을 닫거나 로그아웃하면 다시 선택해야 할 수 있어요.</Text>
      </View>}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: Spacing.sm }, input: { minHeight: 52, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
  optional: { borderTopWidth: 1, marginTop: Spacing.sm }, heading: { minHeight: 48, paddingTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 22, fontWeight: '600' }, copy: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 23 }, caption: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 20 }, details: { gap: 12, marginTop: 12 },
});
