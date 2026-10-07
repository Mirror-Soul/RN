import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { AlertButton } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useProfileQuery } from '../hooks/useProfileQuery';
import { useProfilePhotoMutation } from './useProfilePhotoMutation';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { ProfilePhoto, type ProfilePhotoLoadState } from './ProfilePhoto';
import { ProfilePhotoEditor, type EditableProfilePhoto } from './ProfilePhotoEditor';
import { assertPhotoEditorAvailable, getPhotoPreparationErrorMessage, normalizeSelectedPhoto, PhotoPreparationError } from './prepareProfilePhoto';
import { logger } from '@/src/utils/logger';
import { useToast } from '@/src/components/common/Toast/ToastProvider';
import { ProfilePhotoViewer } from './ProfilePhotoViewer';
import { useRegisteredPhotoPreview, registeredPhotoPreviewUri } from './registeredPhotoPreview';

export function ProfilePhotoManager({ name, signup = false, disabled = false, compact = false, photoViewerOpen = false, onPhotoViewerClose }: {
  name: string; signup?: boolean; disabled?: boolean; compact?: boolean; photoViewerOpen?: boolean; onPhotoViewerClose?: () => void;
}) {
  const { colors } = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const stackActions = fontScale > 1.3;
  const { showToast } = useToast();
  const profile = useProfileQuery();
  const refetchProfile = profile.refetch;
  const registeredPreview = useRegisteredPhotoPreview();
  const mutation = useProfilePhotoMutation();
  const [photo, setPhoto] = useState<EditableProfilePhoto | null>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageState, setImageState] = useState<ProfilePhotoLoadState>('empty');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [imageAttempt, setImageAttempt] = useState(0);
  const closeViewer = () => { setViewerOpen(false); onPhotoViewerClose?.(); };
  const lock = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const currentUrl = profile.data ? profile.data.profileImageUrl : registeredPreview?.url;
  const previewUri = registeredPhotoPreviewUri(registeredPreview, currentUrl);
  useEffect(() => { if (!currentUrl) setViewerOpen(false); }, [currentUrl]);
  useEffect(() => {
    // Fetch a current signed URL on opening, without remounting the native Modal.
    if ((viewerOpen || photoViewerOpen) && typeof refetchProfile === 'function') void refetchProfile();
  }, [viewerOpen, photoViewerOpen, refetchProfile]);
  const busy = picking || mutation.isPending || disabled;
  const retryImage = () => { setImageAttempt(value => value + 1); void profile.refetch(); };
  const pick = async (camera: boolean) => {
    if (lock.current || busy) return;
    lock.current = true;
    setPicking(true);
    setError(null);
    const userUuid = useAuthStore.getState().userUuid;
    let sessionEnded = false;
    const unsubscribe = useAuthStore.subscribe(state => {
      if (!state.isLoggedIn || state.userUuid !== userUuid) sessionEnded = true;
    });
    try {
      await assertPhotoEditorAvailable();
      if (sessionEnded || !alive.current) return;
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('카메라 권한이 필요해요', '사진을 촬영하려면 카메라 접근을 허용해 주세요. 앨범에서 선택할 수도 있어요.', [
            { text: '닫기', style: 'cancel' },
            ...(!permission.canAskAgain ? [{ text: '설정 열기', onPress: () => { void Linking.openSettings(); } }] : []),
          ]);
          return;
        }
      }
      // 시스템 사진 선택기는 제한된 접근도 지원한다. 전체 앨범 권한을 먼저 강요하지 않는다.
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: false, quality: 1 };
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result?.canceled || sessionEnded || !alive.current) return;
      const asset = result?.assets?.[0];
      if (!asset?.uri) throw new PhotoPreparationError('선택한 사진을 불러오지 못했어요. 다른 사진을 선택해 주세요.');
      const normalized = await normalizeSelectedPhoto(asset.uri);
      if (sessionEnded || !alive.current) {
        await FileSystem.deleteAsync(normalized.uri, { idempotent: true });
        return;
      }
      setPhoto(normalized);
    } catch (error) {
      logger.warn('Profile photo selection failed', error);
      if (alive.current && !sessionEnded) setError(getPhotoPreparationErrorMessage(error, '사진을 불러오지 못했어요. 다른 사진을 선택해 주세요.'));
    } finally {
      unsubscribe();
      lock.current = false;
      if (alive.current) setPicking(false);
    }
  };
  const remove = () => {
    Alert.alert('프로필 사진을 삭제할까요?', '기본 이미지로 바뀌어요. 사진 없이도 상대를 둘러보고 트윈과 통화할 수 있어요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => {
        if (lock.current || disabled) return;
        lock.current = true;
        setError(null);
        try {
          const result = await mutation.remove();
          if (result === null && alive.current) showToast('프로필 사진을 삭제했어요.', 'success');
        }
        catch (error) { if (alive.current) setError(getErrorDisplayMessage(error, '사진을 삭제하지 못했어요. 다시 시도해 주세요.')); }
        finally { lock.current = false; }
      } },
    ]);
  };
  const openMenu = () => {
    const buttons: AlertButton[] = [
      { text: '앨범에서 선택', onPress: () => { void pick(false); } },
      { text: '사진 촬영', onPress: () => { void pick(true); } },
    ];
    buttons.push({ text: '취소', style: 'cancel' });
    // Android Alert는 최대 3개 버튼만 지원한다. 삭제는 아래 별도 버튼으로 제공한다.
    Alert.alert(currentUrl ? '사진을 바꿔볼까요?' : '사진을 추가해 볼까요?', '얼굴이 잘 보이는 사진이면 상대가 나를 알아보기 쉬워요.', buttons);
  };
  return (
    <View style={compact ? [styles.compact, { borderColor: colors.border.primary }] : [styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
      {!compact && <View style={[styles.row, stackActions && styles.stackedRow]}>
        <ProfilePhoto key={`${currentUrl ?? 'empty'}:${imageAttempt}`} uri={currentUrl} previewUri={previewUri} name={name} size={64} onLoadStateChange={setImageState} onRetry={retryImage} onPress={() => setViewerOpen(true)} />
        <View style={[styles.copy, stackActions && styles.stackedCopy]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text.primary }]}>프로필 사진</Text>
            {signup && <View style={[styles.badge, { backgroundColor: colors.background.glass }]}><Text style={[styles.badgeText, { color: colors.text.secondary }]}>선택</Text></View>}
          </View>
          <Text style={[styles.help, { color: colors.text.secondary }]}>{currentUrl ? '나중에 언제든 바꾸거나 삭제할 수 있어요.' : signup ? '지금은 건너뛰어도 괜찮아요.\n나중에 언제든 추가할 수 있어요.' : '상대에게 보이는 나의 사진이에요.'}</Text>
        </View>
      </View>}
      {!!currentUrl && <View style={styles.status}>
        <Feather name="check-circle" size={16} color={colors.state.success} />
        <Text style={[styles.caption, { color: colors.text.secondary }]}>사진 등록됨</Text>
      </View>}
      {!!currentUrl && !compact && imageState === 'error' && <View style={styles.retryNotice}>
        <Text accessibilityRole="alert" style={[styles.caption, { color: colors.text.secondary }]}>{previewUri ? '방금 등록한 사진을 미리 보여드리고 있어요. 등록된 사진을 다시 불러와 확인해주세요.' : '등록된 사진을 불러오지 못했어요. 다시 불러오거나 사진을 바꿔주세요.'}</Text>
        <Pressable onPress={retryImage} disabled={busy || profile.isFetching} accessibilityRole="button" accessibilityLabel="등록된 프로필 사진 다시 불러오기" accessibilityState={{ disabled: busy || profile.isFetching }} style={styles.action}>
          {profile.isFetching ? <ActivityIndicator color={colors.brand.accent} /> : <Feather name="refresh-cw" size={16} color={colors.brand.accent} />}
          <Text style={[styles.actionText, { color: colors.brand.accent }]}>사진 다시 불러오기</Text>
        </Pressable>
      </View>}
      {!compact && <View style={[styles.notice, { borderColor: colors.border.primary }]}>
        <Feather name="eye" size={16} color={colors.text.secondary} style={styles.noticeIcon} />
        <View style={styles.noticeCopy}>
          <Text style={[styles.help, { color: colors.text.secondary }]}>추천 카드·프로필·채팅에 보여요.</Text>
          <Text style={[styles.caption, { color: colors.text.secondary }]}>본인 얼굴이 잘 보이는 사진을 권장해요. 트윈을 만드는 얼굴 스캔과는 따로 사용해요.</Text>
        </View>
      </View>}
      {compact && !currentUrl && <Text style={[styles.help, { color: colors.text.muted }]}>사진 없이도 이용할 수 있어요. 원할 때 추가해 주세요.</Text>}
      {profile.isError && !currentUrl ? (
        <Pressable onPress={() => profile.refetch()} accessibilityRole="button" style={styles.action}><Text style={[styles.actionText, { color: colors.state.danger }]}>사진을 확인하지 못했어요 · 다시 시도</Text></Pressable>
      ) : <View style={[styles.actions, stackActions && styles.stackedActions]}>
        <Pressable disabled={busy || profile.isLoading} onPress={openMenu} accessibilityRole="button" accessibilityLabel={currentUrl ? '프로필 사진 변경' : '프로필 사진 추가'} accessibilityState={{ disabled: busy || profile.isLoading }} style={[styles.action, styles.addAction, stackActions && styles.stackedAction, { backgroundColor: colors.background.glass, borderColor: colors.border.primary, opacity: busy || profile.isLoading ? 0.5 : 1 }]}>
          {busy || profile.isLoading ? <ActivityIndicator color={colors.brand.accent} /> : <Feather name="camera" size={18} color={colors.brand.accent} />}
          <Text style={[styles.actionText, { color: colors.brand.accent }]}>{picking ? '사진 불러오는 중…' : mutation.isPending ? '사진 삭제 중…' : currentUrl ? '사진 바꾸기' : '사진 추가하기'}</Text>
        </Pressable>
        {!!currentUrl && <Pressable disabled={busy} onPress={remove} accessibilityRole="button" accessibilityLabel="프로필 사진 삭제" accessibilityState={{ disabled: busy }} style={[styles.action, styles.deleteAction, stackActions && styles.stackedAction, { borderColor: colors.border.primary, opacity: busy ? 0.5 : 1 }]}>
          <Feather name="trash-2" size={16} color={colors.state.danger} />
          <Text style={[styles.actionText, { color: colors.state.danger }]}>사진 삭제</Text>
        </Pressable>}
      </View>}
      {error && <Text accessibilityRole="alert" style={[styles.help, { color: colors.state.danger }]}>{error}</Text>}
      {!!currentUrl && (viewerOpen || photoViewerOpen) && <ProfilePhotoViewer uri={currentUrl} previewUri={previewUri} onRetry={retryImage} name={name} disabled={busy} onClose={closeViewer} onChange={openMenu} onDelete={remove} />}
      {photo && <ProfilePhotoEditor photo={photo} name={name} onClose={() => setPhoto(null)} onSaved={() => showToast('프로필 사진을 등록했어요.', 'success')} />}
    </View>
  );
}
const styles = StyleSheet.create({
  compact: { width: '100%', marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, gap: Spacing.md },
  card: { width: '100%', padding: Spacing.xl, gap: Spacing.lg, borderWidth: 1, borderRadius: Radii.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, copy: { flex: 1, gap: Spacing.sm },
  stackedRow: { flexDirection: 'column', alignItems: 'stretch' },
  stackedCopy: { flex: 0, width: '100%' },
  status: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  retryNotice: { gap: Spacing.xs },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 24, fontWeight: FontWeight.semibold },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs, borderRadius: Radii.full },
  badgeText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 18, fontWeight: FontWeight.medium },
  help: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  caption: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 20, flexShrink: 1 },
  notice: { flexDirection: 'row', gap: Spacing.sm, paddingTop: Spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
  noticeIcon: { marginTop: 3 }, noticeCopy: { flex: 1, gap: Spacing.xs },
  actions: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: Spacing.md },
  stackedActions: { flexDirection: 'column', flexWrap: 'nowrap' },
  action: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.md },
  addAction: { flexGrow: 1, flexShrink: 1, flexBasis: 160, minWidth: 140, borderWidth: 1 },
  deleteAction: { flexGrow: 1, flexShrink: 1, flexBasis: 100, minWidth: 100, borderWidth: 1 },
  stackedAction: { width: '100%', flexGrow: 0, flexShrink: 0, flexBasis: 'auto', minWidth: 0 },
  actionText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, fontWeight: FontWeight.semibold, flexShrink: 1, textAlign: 'center' },
});
