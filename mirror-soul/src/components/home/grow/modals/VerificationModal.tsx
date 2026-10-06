import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { useMatchingDesign } from '@/src/features/match/components/MatchingDesign';
import { useLayout } from '@/src/hooks/useLayout';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { jobCategories } from '@/src/components/signup/steps/Step2_BasicProfile/Professional/jobData';
import type { JobEnum } from '@/src/types/api/onboarding';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submitted: boolean | null;
  job: JobEnum | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}
export default function VerificationModal(props: Props) {
  // A new form on every opening/session prevents a private document from lingering on another account.
  return props.isOpen ? <JobVerificationForm {...props} /> : null;
}
function JobVerificationForm({ onClose, submitted, job, loading, error, onRetry }: Props) {
  const { colors, palette } = useMatchingDesign();
  const { contentContainerStyle } = useLayout();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [picking, setPicking] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const pickingLock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const pick = async (camera: boolean) => {
    if (pickingLock.current) return;
    pickingLock.current = true; setPicking(true);
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!mounted.current) return;
        if (!permission.granted) {
          Alert.alert('카메라 접근을 허용해 주세요', '사진첩에서 선택하거나 휴대폰 설정에서 카메라 접근을 허용할 수 있어요.', [
            { text: '닫기', style: 'cancel' }, { text: '기기 설정 열기', onPress: () => { void Linking.openSettings().catch(() => Alert.alert('설정을 열지 못했어요', '휴대폰 설정에서 Mirror Soul의 카메라 권한을 확인해 주세요.')); } },
          ]); return;
        }
      }
      const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false, selectionLimit: 1 });
      const asset = !result.canceled ? result.assets?.[0] : undefined;
      if (mounted.current && !result.canceled && !asset?.uri) throw new Error('사진을 읽지 못했어요. 다른 사진을 선택해 주세요.');
      if (mounted.current && asset?.uri) { setPhoto(asset); setPreviewFailed(false); }
    } catch (e) { if (mounted.current) Alert.alert('사진을 선택하지 못했어요', getErrorDisplayMessage(e, '잠시 후 다시 시도해 주세요.')); }
    finally { pickingLock.current = false; if (mounted.current) setPicking(false); }
  };
  const close = () => { if (!pickingLock.current) onClose(); };
  return <BottomSheet isOpen onClose={close} dragFromHandleOnly height={Math.max(0, height - insets.top - 12)}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.body, contentContainerStyle, { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right, paddingBottom: 24 + insets.bottom }]}>
      <View style={styles.heading}><Text variant="heading" accessibilityRole="header" style={[styles.title, { color: colors.text.primary }]}>직업 인증</Text>
        <Pressable onPress={close} disabled={picking} accessibilityRole="button" accessibilityLabel="직업 인증 닫기" style={styles.close}><Feather name="x" size={22} color={colors.text.secondary} /></Pressable></View>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>재직증명서 등 직업을 확인할 수 있는 서류를 준비해 주세요. 공개 프로필 사진과는 별개예요.</Text>
      <View style={[styles.notice, { backgroundColor: palette.coolTint }]}>
        <Text style={[styles.noticeTitle, { color: colors.text.primary }]}>서류 제출 기능을 준비하고 있어요</Text>
        <Text style={[styles.copy, { color: colors.text.secondary }]}>지금은 사진 선택과 미리보기만 가능해요. 선택한 사진은 서버로 전송되지 않고, 이 창을 닫으면 선택이 해제돼요.</Text>
      </View>
      <View style={[styles.notice, { borderWidth: 1, borderColor: colors.border.primary }]}>
        <Text style={[styles.noticeTitle, { color: colors.text.primary }]}>{jobCategories.find(item => item.value === job)?.label || '내 직업 확인 서류'}</Text>
        {loading ? <ActivityIndicator color={palette.cyanInk} /> : error ? <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="직업 서류 제출 여부 다시 확인" style={styles.retry}><Text style={[styles.copy, { color: palette.cyanInk }]}>제출 여부를 확인하지 못했어요. 다시 확인하기</Text></Pressable>
          : <Text style={[styles.copy, { color: colors.text.secondary }]}>{submitted === true ? '가입 때 서류를 추가했어요. 제출 여부만 확인할 수 있으며, 인증 결과는 아직 표시되지 않아요.' : submitted === false ? '가입할 때 추가한 서류가 없어요. 직업 인증은 선택 사항이에요.' : '서류 제출 여부를 확인할 수 없어요.'}</Text>}
      </View>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>주민등록번호·주소·급여 등 직업 확인에 필요 없는 정보는 먼저 가려주세요. 서류 내용이 읽히도록 촬영해 주세요.</Text>
      {photo && <View style={[styles.preview, { borderColor: colors.border.primary }]}><Image source={{ uri: photo.uri }} style={styles.photo} contentFit="contain" accessibilityLabel="선택한 직업 확인 서류 사진" onError={() => setPreviewFailed(true)} />
        {previewFailed && <Text accessibilityRole="alert" style={[styles.previewError, { color: colors.text.secondary }]}>사진을 불러오지 못했어요. 다른 사진을 선택해 주세요.</Text>}
        <View style={styles.photoInfo}><Text numberOfLines={1} style={[styles.fileName, { color: colors.text.secondary }]}>{photo.fileName || '선택한 서류 사진'}</Text>
          <Pressable onPress={() => setPhoto(null)} disabled={picking} accessibilityRole="button" accessibilityLabel="첨부 사진 삭제" style={styles.close}><Feather name="trash-2" size={18} color={colors.text.secondary} /></Pressable></View></View>}
      <View style={styles.sources}>
        <Pressable onPress={() => { void pick(false); }} disabled={picking} accessibilityRole="button" accessibilityLabel="사진첩에서 직업 서류 선택" style={[styles.source, { borderColor: colors.border.primary }]}><Feather name="image" size={18} color={palette.cyanInk} /><Text style={[styles.buttonText, { color: colors.text.primary }]}>{photo ? '사진 바꾸기' : '사진 선택'}</Text></Pressable>
        <Pressable onPress={() => { void pick(true); }} disabled={picking} accessibilityRole="button" accessibilityLabel="직업 서류 촬영" style={[styles.source, { borderColor: colors.border.primary }]}><Feather name="camera" size={18} color={palette.cyanInk} /><Text style={[styles.buttonText, { color: colors.text.primary }]}>촬영하기</Text></Pressable>
      </View>
      {picking && <ActivityIndicator accessibilityLabel="사진 선택 중" color={palette.cyanInk} />}
      <Text style={[styles.caption, { color: colors.text.secondary }]}>제출 기능이 열리면 담당자가 서류를 확인해요. 확인에는 시간이 걸릴 수 있으며, 제출만으로 인증이 완료되지는 않아요.</Text>
      <Pressable disabled accessibilityRole="button" accessibilityLabel="직업 인증 서류 제출 준비 중" accessibilityState={{ disabled: true }} style={[styles.submit, { backgroundColor: colors.background.glass }]}><Text style={[styles.buttonText, { color: colors.text.muted }]}>서류 제출 준비 중</Text></Pressable>
      <Pressable onPress={close} disabled={picking} accessibilityRole="button" accessibilityLabel="직업 인증 나중에 하기" style={styles.closeAction}><Text style={[styles.buttonText, { color: colors.text.secondary }]}>나중에 하기</Text></Pressable>
    </ScrollView>
  </BottomSheet>;
}
const styles = StyleSheet.create({
  body: { gap: 14 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, minWidth: 0, fontSize: 24, lineHeight: 34, fontWeight: '600' },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  copy: { fontSize: 14, lineHeight: 23 }, caption: { fontSize: 12, lineHeight: 20 },
  notice: { padding: 14, borderRadius: 14, gap: 8 }, noticeTitle: { fontSize: 14, lineHeight: 22, fontWeight: '600' },
  retry: { minHeight: 48, justifyContent: 'center' }, preview: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  previewError: { fontSize: 13, lineHeight: 21, paddingHorizontal: 12, paddingBottom: 10 },
  photo: { width: '100%', height: 190 }, photoInfo: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12 },
  fileName: { flex: 1, minWidth: 0, fontSize: 12, lineHeight: 20 }, sources: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  source: { flexGrow: 1, minHeight: 48, padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 14 },
  buttonText: { flexShrink: 1, fontSize: 14, lineHeight: 22, fontWeight: '500', textAlign: 'center' },
  submit: { minHeight: 48, padding: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, closeAction: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
});
