import { Feather } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import FormLabel from '@/src/components/signup/common/FormLabel';
import StepSelectDropdown from '@/src/components/signup/common/StepSelectDropdown';
import { useDropdownAnchor } from '@/src/components/signup/common/useDropdownAnchor';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import JobCategoryDropdown from '../Professional/JobCategoryDropdown';
import { SectionProps } from '../types/step2';
import { jobCategories } from '../Professional/jobData';
import { SIGNUP_KEYBOARD_ACCESSORY_ID } from '@/src/components/signup/common/SignupFormScreen';

interface Props extends SectionProps { onVerify: (fileUri: string, contentType: string, fileName: string) => Promise<void> }
export default function JobVerificationSection({ state, onChange, onVerify }: Props) {
  const { colors } = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [picking, setPicking] = useState(false);
  const pickingLock = useRef(false);
  const { triggerRef, anchor, measureAndOpen } = useDropdownAnchor();
  const blocked = state.isJobVerifying || picking;
  const detailsVisible = expanded || state.isJobVerifying;
  const pick = async (source: 'camera' | 'file') => {
    if (pickingLock.current || state.isJobVerifying) return;
    pickingLock.current = true;
    setPicking(true);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== 'granted') { Alert.alert('카메라 권한이 필요해요', '휴대폰 설정에서 카메라 접근을 허용해주세요.'); return; }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        const asset = !result.canceled ? result.assets?.[0] : undefined;
        if (asset) await onVerify(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || `camera_${Date.now()}.jpg`);
      } else {
        const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
        const asset = !result.canceled ? result.assets?.[0] : undefined;
        if (asset) await onVerify(asset.uri, asset.mimeType || 'application/octet-stream', asset.name);
      }
    } catch (error) {
      Alert.alert('서류를 선택하지 못했어요', getErrorDisplayMessage(error, '잠시 후 다시 시도해주세요.'));
    } finally { pickingLock.current = false; setPicking(false); }
  };
  const chooseSource = () => Alert.alert('직업 확인 서류 추가', '서류를 촬영하거나 저장된 파일을 선택해주세요.', [
    { text: '카메라로 촬영', onPress: () => void pick('camera') },
    { text: '파일에서 선택', onPress: () => void pick('file') },
    { text: '취소', style: 'cancel' },
  ]);
  return <View style={styles.container}>
    <FormLabel label="직군" optional={false} />
    <View ref={triggerRef}>
      <StepSelectDropdown label="" placeholder={jobCategories.find(job => job.value === state.jobCategory)?.label || '가까운 직군을 선택해주세요'} hasValue={!!state.jobCategory}
        disabled={blocked} isOpen={isOpen} onPress={() => isOpen ? setIsOpen(false) : measureAndOpen(() => setIsOpen(true))} />
    </View>
    {isOpen && anchor && <JobCategoryDropdown anchor={anchor} onSelect={job => { if (job !== state.jobCategory) onChange({ jobCategory: job, isJobVerified: false, jobCertificationObjectKey: null }); setIsOpen(false); }} onClose={() => setIsOpen(false)} />}
    <FormLabel label="하는 일 한 줄" optional />
    <TextInput accessibilityLabel="하는 일 한 줄, 선택" style={[styles.input, { color: colors.text.primary, borderColor: colors.border.primary, backgroundColor: colors.background.glass }]} value={state.jobTitle}
      inputAccessoryViewID={Platform.OS === 'ios' ? SIGNUP_KEYBOARD_ACCESSORY_ID : undefined} returnKeyType="done" onSubmitEditing={() => Keyboard.dismiss()}
      onChangeText={jobTitle => onChange({ jobTitle })} placeholder="예: 작은 브랜드를 디자인해요" placeholderTextColor={colors.text.muted} />
    <View style={[styles.optional, { borderColor: colors.border.primary }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="직업 확인 서류, 선택" accessibilityState={{ expanded: detailsVisible, disabled: blocked }} disabled={blocked} onPress={() => setExpanded(value => !value)} style={styles.optionalHeading}>
        <View style={styles.optionalCopy}>
          <Text style={[styles.title, { color: state.isJobVerified ? colors.state.success : colors.text.primary }]}>{state.isJobVerified ? '직업 확인 서류 추가됨' : '직업 확인 서류 · 선택'}</Text>
          <Text style={[styles.copy, { color: colors.text.secondary }]}>서류 없이도 가입을 계속할 수 있어요.</Text>
        </View>
        <Feather name={detailsVisible ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.secondary} />
      </Pressable>
      {detailsVisible && <View style={styles.details}>
        <Text style={[styles.copy, { color: colors.text.secondary }]}>{state.isJobVerified ? '서류를 올렸어요. 프로필을 저장하면 함께 등록돼요. 다른 직군으로 바꾸면 다시 추가해주세요.' : '재직증명서 등 직업을 확인할 수 있는 사진이나 PDF를 추가해주세요.'}</Text>
        {!state.isJobVerified && <Pressable accessibilityRole="button" accessibilityState={{ disabled: blocked, busy: blocked }} disabled={blocked} onPress={chooseSource}
          style={[styles.addButton, { borderColor: colors.brand.accent }]}>
          {blocked ? <ActivityIndicator size="small" color={colors.brand.accent} /> : <Feather name="upload" size={17} color={colors.brand.accent} />}
          <Text style={[styles.title, { color: colors.brand.accent }]}>{state.isJobVerifying ? '서류 올리는 중…' : picking ? '서류 선택 중…' : '서류 추가'}</Text>
        </Pressable>}
      </View>}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  input: { minHeight: 52, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24 },
  optional: { borderTopWidth: 1, marginTop: Spacing.sm },
  optionalHeading: { minHeight: 44, paddingTop: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  optionalCopy: { flex: 1, gap: Spacing.xs },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  details: { gap: Spacing.md, marginTop: Spacing.md },
  addButton: { minHeight: 44, padding: Spacing.sm, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: Radii.md },
});
