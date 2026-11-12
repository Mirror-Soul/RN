import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '@/src/store/useAuthStore';
import { FontFamily } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import type { JobEnum } from '@/src/types/api/onboarding';
import { addEvidencePhoto, evidenceSessionValid, removeEvidence, syncEvidenceDraft, useEvidenceDraft } from './evidenceDraft';
import { deleteEvidencePhoto, prepareEvidencePhoto } from './prepareEvidencePhoto';

export function EvidencePicker({ job, disabled = false }: { job: JobEnum | null; disabled?: boolean }) {
  const { colors } = useThemeColors();
  const owner = useAuthStore(s => s.userUuid);
  const draft = useEvidenceDraft();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [broken, setBroken] = useState<string[]>([]);
  useEffect(() => { syncEvidenceDraft(owner, job); }, [owner, job]);
  const photos = draft.owner === owner && draft.job === job ? draft.photos : [];
  const blocked = disabled || draft.busy || !owner || !job;
  const pick = async (camera: boolean, replaceId?: string) => {
    const current = useEvidenceDraft.getState();
    if (blocked || current.busy || !owner || !job || (!replaceId && current.photos.length >= 5)) return;
    const generation = current.generation;
    useEvidenceDraft.setState({ busy: true, phase: '사진을 준비하고 있어요', error: null });
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!evidenceSessionValid(owner, generation)) return;
        if (!permission.granted) {
          Alert.alert('카메라 접근을 허용해 주세요', '사진첩에서 선택하거나 기기 설정에서 카메라 접근을 허용할 수 있어요.', [
            { text: '닫기', style: 'cancel' }, { text: '기기 설정 열기', onPress: () => { void Linking.openSettings().catch(() => {}); } },
          ]); return;
        }
      }
      const result = camera ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false, selectionLimit: 1 });
      if (!evidenceSessionValid(owner, generation) || result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) throw new Error('사진을 읽지 못했어요. 다른 사진을 선택해 주세요.');
      const photo = await prepareEvidencePhoto(asset.uri);
      if (!evidenceSessionValid(owner, generation)) { void deleteEvidencePhoto(photo); return; }
      addEvidencePhoto(photo, replaceId);
    } catch (error) {
      if (evidenceSessionValid(owner, generation)) useEvidenceDraft.setState({ error: getErrorDisplayMessage(error, '사진을 준비하지 못했어요. 다른 사진을 선택해 주세요.') });
    } finally {
      if (evidenceSessionValid(owner, generation)) useEvidenceDraft.setState({ busy: false, phase: '' });
    }
  };
  return <View style={styles.body}>
    <Text style={[styles.copy, { color: colors.text.secondary }]}>직업을 확인할 수 있는 사진을 추가해 주세요. 주민등록번호·주소·급여 등 불필요한 정보는 먼저 가려주세요.</Text>
    <View style={styles.heading}><Text style={[styles.label, { color: colors.text.primary }]}>첨부 사진</Text><Text style={[styles.caption, { color: colors.text.secondary }]}>{photos.length}/5장 · 한 장당 5MB 이하</Text></View>
    {photos.map((photo, index) => <View key={photo.id} style={[styles.photoCard, { borderColor: colors.border.primary }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`직업 서류 사진 ${index + 1} ${expanded === photo.id ? '작게' : '크게'} 보기`} onPress={() => setExpanded(value => value === photo.id ? null : photo.id)}>
        <Image source={{ uri: photo.uri }} contentFit="contain" cachePolicy="none" style={[styles.image, expanded === photo.id && styles.expanded]} accessibilityLabel={`선택한 직업 서류 사진 ${index + 1}`} onError={() => { setBroken(ids => ids.includes(photo.id) ? ids : [...ids, photo.id]); useEvidenceDraft.setState(s => ({ photos: s.photos.map(p => p.id === photo.id ? { ...p, previewFailed: true } : p) })); }} />
      </Pressable>
      {broken.includes(photo.id) && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger, padding: 12 }]}>사진을 불러오지 못했어요. 다른 사진으로 바꿔주세요.</Text>}
      <View style={styles.photoActions}><Text style={[styles.caption, { color: colors.text.secondary, flex: 1 }]}>사진 {index + 1} · {Math.max(1, Math.round(photo.size / 1024))}KB</Text>
        <Pressable disabled={blocked} onPress={() => { void pick(false, photo.id); }} accessibilityRole="button" accessibilityLabel={`직업 서류 사진 ${index + 1} 바꾸기`} style={styles.action}><Text style={[styles.caption, { color: colors.brand.accent }]}>바꾸기</Text></Pressable>
        <Pressable disabled={blocked} onPress={() => removeEvidence(photo.id)} accessibilityRole="button" accessibilityLabel={`직업 서류 사진 ${index + 1} 삭제`} style={styles.action}><Feather name="trash-2" size={18} color={colors.text.secondary} /></Pressable>
      </View>
    </View>)}
    {photos.length < 5 && <View style={styles.sources}>
      <Pressable disabled={blocked} onPress={() => { void pick(false); }} accessibilityRole="button" accessibilityLabel="사진첩에서 직업 서류 선택" style={[styles.source, { borderColor: colors.border.primary }]}><Feather name="image" size={18} color={colors.brand.accent} /><Text style={[styles.label, { color: colors.text.primary }]}>{photos.length ? '사진 추가' : '사진 선택'}</Text></Pressable>
      <Pressable disabled={blocked} onPress={() => { void pick(true); }} accessibilityRole="button" accessibilityLabel="직업 서류 촬영" style={[styles.source, { borderColor: colors.border.primary }]}><Feather name="camera" size={18} color={colors.brand.accent} /><Text style={[styles.label, { color: colors.text.primary }]}>촬영하기</Text></Pressable>
    </View>}
    {draft.busy && <View style={styles.progress}><ActivityIndicator color={colors.brand.accent} /><Text accessibilityLiveRegion="polite" style={[styles.copy, { color: colors.text.secondary }]}>{draft.phase}{draft.progress == null ? '' : ` · ${draft.progress}%`}</Text></View>}
    {draft.error && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>{draft.error}</Text>}
    {!!photos.length && <Text style={[styles.caption, { color: colors.text.secondary }]}>사진을 눌러 글자가 읽히는지 확인해 주세요. 첨부만으로는 서버에 제출되지 않아요.</Text>}
  </View>;
}
const styles = StyleSheet.create({
  body: { gap: 10 }, heading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 4 },
  copy: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 23 }, label: { fontFamily: FontFamily.sans, fontSize: 14, lineHeight: 22, fontWeight: '600' }, caption: { fontFamily: FontFamily.sans, fontSize: 12, lineHeight: 20 },
  photoCard: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' }, image: { height: 130, width: '100%' }, expanded: { height: 340 },
  photoActions: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12 }, action: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  sources: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, source: { flexGrow: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, minHeight: 48, padding: 12, borderWidth: 1, borderRadius: 14 },
  progress: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
});
