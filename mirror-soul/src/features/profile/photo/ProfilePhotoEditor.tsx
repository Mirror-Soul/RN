import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { constrainTransform, getCoverScale, getCropRect, PROFILE_PHOTO_ASPECT, type PhotoTransform } from './photoGeometry';
import { getPhotoPreparationErrorMessage, prepareProfilePhoto, removePreparedPhoto, rotateSelectedPhoto, type PreparedProfilePhoto } from './prepareProfilePhoto';
import { useProfilePhotoMutation } from './useProfilePhotoMutation';
import { logger } from '@/src/utils/logger';
import { CroppedPhotoPreview } from './CroppedPhotoPreview';

export interface EditableProfilePhoto { uri: string; width: number; height: number }
const identity: PhotoTransform = { zoom: 1, x: 0, y: 0 };

function touchPosition(event: GestureResponderEvent) {
  const touches = event.nativeEvent?.touches ?? [];
  const a = touches[0];
  if (!a) return null;
  const b = touches[1];
  return {
    count: touches.length,
    x: b ? (a.pageX + b.pageX) / 2 : a.pageX,
    y: b ? (a.pageY + b.pageY) / 2 : a.pageY,
    distance: b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0,
  };
}

export function ProfilePhotoEditor({ photo, name, onClose, onSaved }: { photo: EditableProfilePhoto; name: string; onClose: () => void; onSaved?: () => void }) {
  const { colors, isDark } = useThemeColors();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const frameWidth = Math.max(160, Math.min(window.width - 40, (window.height - insets.top - insets.bottom - 440) * PROFILE_PHOTO_ASPECT));
  const frame = { width: frameWidth, height: frameWidth / PROFILE_PHOTO_ASPECT };
  const [source, setSource] = useState(photo);
  const sourceUri = useRef(source.uri);
  sourceUri.current = source.uri;
  const [rotation, setRotation] = useState(0);
  const [rotating, setRotating] = useState(false);
  const rotatedFiles = useRef(new Set<string>());
  const [transform, setTransform] = useState(identity);
  const transformRef = useRef(identity);
  const [prepared, setPrepared] = useState<PreparedProfilePhoto | null>(null);
  const preparedRef = useRef<PreparedProfilePhoto | null>(null);
  const [mode, setMode] = useState<'detail' | 'card' | 'avatar'>('detail');
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceFailed, setSourceFailed] = useState(false);
  const operation = useRef(false);
  const alive = useRef(true);
  const save = useProfilePhotoMutation();
  const busy = preparing || rotating || save.isPending;
  const anchor = useRef<NonNullable<ReturnType<typeof touchPosition>> & { transform: PhotoTransform } | null>(null);
  const adjust = (value: PhotoTransform) => {
    const next = constrainTransform(source, frame, value);
    transformRef.current = next;
    setTransform(next);
  };
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => !busy && !prepared,
    onMoveShouldSetPanResponder: () => !busy && !prepared,
    onPanResponderGrant: event => {
      const point = touchPosition(event);
      anchor.current = point ? { ...point, transform: transformRef.current } : null;
    },
    onPanResponderMove: event => {
      const point = touchPosition(event);
      if (!point) return;
      if (!anchor.current || point.count !== anchor.current.count) {
        anchor.current = { ...point, transform: transformRef.current };
        return;
      }
      const start = anchor.current;
      adjust({
        zoom: start.distance && point.distance ? start.transform.zoom * point.distance / start.distance : start.transform.zoom,
        x: start.transform.x + point.x - start.x,
        y: start.transform.y + point.y - start.y,
      });
    },
    onPanResponderRelease: () => { anchor.current = null; },
    onPanResponderTerminate: () => { anchor.current = null; },
    onPanResponderTerminationRequest: () => false,
  });

  useEffect(() => {
    alive.current = true;
    const files = rotatedFiles.current;
    return () => {
      alive.current = false;
      // StrictMode의 effect 재실행에서는 사용 중인 파일을 지우지 않는다.
      void Promise.resolve().then(() => {
        if (alive.current) return;
        void removePreparedPhoto(preparedRef.current);
        for (const uri of files) void FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
        void FileSystem.deleteAsync(photo.uri, { idempotent: true }).catch(() => {});
      });
    };
  }, [photo.uri]);

  const close = () => {
    if (operation.current || busy) return;
    Alert.alert('사진 편집을 마칠까요?', '지금 편집한 사진은 등록되지 않아요.', [
      { text: '계속 편집', style: 'cancel' },
      { text: '나가기', style: 'destructive', onPress: onClose },
    ]);
  };
  const preview = async () => {
    if (operation.current || sourceFailed) return;
    operation.current = true;
    setPreparing(true);
    setError(null);
    try {
      const result = await prepareProfilePhoto(source.uri, getCropRect(source, frame, transformRef.current));
      if (!alive.current) { await removePreparedPhoto(result); return; }
      preparedRef.current = result;
      setPrepared(result);
    } catch (error) {
      logger.warn('Profile photo preparation failed', error);
      if (alive.current) setError(getPhotoPreparationErrorMessage(error, '사진을 준비하지 못했어요. 다시 시도해 주세요.'));
    } finally {
      operation.current = false;
      if (alive.current) setPreparing(false);
    }
  };
  const rotate = async () => {
    if (operation.current || busy || prepared) return;
    operation.current = true;
    setRotating(true);
    setError(null);
    const degrees = (rotation + 90) % 360;
    try {
      const next = degrees === 0 ? photo : await rotateSelectedPhoto(photo.uri, degrees);
      if (!alive.current) {
        if (next.uri !== photo.uri) await FileSystem.deleteAsync(next.uri, { idempotent: true }).catch(() => {});
        return;
      }
      if (next.uri !== photo.uri) rotatedFiles.current.add(next.uri);
      anchor.current = null;
      transformRef.current = identity;
      setTransform(identity);
      setSource(next);
      setRotation(degrees);
      setSourceFailed(false);
    } catch (error) {
      logger.warn('Profile photo rotation failed', error);
      if (alive.current) setError(getPhotoPreparationErrorMessage(error, '사진을 회전하지 못했어요. 다시 시도해 주세요.'));
    } finally {
      operation.current = false;
      if (alive.current) setRotating(false);
    }
  };
  const submit = async () => {
    if (!prepared || operation.current) return;
    operation.current = true;
    setError(null);
    try {
      const result = await save.save(prepared);
      if (result !== undefined && alive.current) {
        onClose();
        onSaved?.();
      }
    } catch (error) {
      if (alive.current) setError(getErrorDisplayMessage(error, '사진을 저장하지 못했어요. 편집한 사진은 유지했으니 다시 등록해 주세요.'));
    } finally { operation.current = false; }
  };
  const backToCrop = () => {
    if (operation.current) return;
    void removePreparedPhoto(preparedRef.current);
    preparedRef.current = null;
    setPrepared(null);
    setError(null);
  };
  const scale = getCoverScale(source, frame) * transform.zoom;
  const crop = getCropRect(source, frame, transform);
  const miniCardWidth = Math.min(140, Math.max(96, (window.width - 120) / 2));
  const uploadPercent = save.uploadProgress == null ? null : Math.floor(save.uploadProgress * 100);
  const stageText = rotating ? '사진을 회전하고 있어요…' : preparing ? '미리보기를 준비하고 있어요…' : save.stage === 'address' ? '업로드를 준비하고 있어요…' : save.stage === 'save' ? '전송 완료 · 프로필에 등록하고 있어요…' : '사진을 올리고 있어요…';
  const previewWidth = mode === 'avatar' ? Math.min(frameWidth, 160) : frameWidth;
  const previewHeight = mode === 'avatar' ? previewWidth : mode === 'card' ? previewWidth * 3 / 4 : previewWidth / PROFILE_PHOTO_ASPECT;

  useEffect(() => {
    const next = constrainTransform(source, { width: frameWidth, height: frameWidth / PROFILE_PHOTO_ASPECT }, transformRef.current);
    transformRef.current = next;
    setTransform(next);
  }, [frameWidth, source]);

  return (
    <Modal visible animationType="slide" onRequestClose={close}>
      <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={[styles.step, { color: colors.text.secondary }]}>{prepared ? '2 / 2 · 미리보기' : '1 / 2 · 사진 편집'}</Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>{prepared ? '이렇게 보여요' : '사진을 맞춰볼까요?'}</Text>
          </View>
          <Pressable onPress={close} disabled={busy} accessibilityRole="button" accessibilityLabel="사진 편집 닫기" style={styles.iconButton}>
            <Feather name="x" size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
          <Text style={[styles.help, { color: colors.text.secondary }]}>
            {prepared ? '화면별로 확인한 뒤 마음에 들면 등록해 주세요.' : '사진을 움직이거나 두 손가락으로 확대해 보세요.\n얼굴을 가운데 두면 더 잘 보여요.'}
          </Text>
          {prepared ? (
            <>
              <View style={styles.tabs}>
                {(['detail', 'card', 'avatar'] as const).map((value, i) => (
                  <Pressable key={value} onPress={() => setMode(value)} disabled={busy} accessibilityRole="button" accessibilityState={{ selected: mode === value, disabled: busy }} style={[styles.tab, { backgroundColor: mode === value ? colors.background.card : 'transparent', borderColor: mode === value ? colors.brand.accent : colors.border.primary }]}>
                    <Text style={[styles.controlText, { color: mode === value ? colors.brand.accent : colors.text.secondary }]}>{['프로필', '추천 카드', '원형 사진'][i]}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.frame, { width: previewWidth, height: previewHeight, borderRadius: mode === 'avatar' ? previewWidth / 2 : Radii.lg }]}>
                <Image source={{ uri: prepared.uri }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="크롭한 사진 미리보기" />
                {mode === 'detail' && (
                  <>
                    <LinearGradient colors={['transparent', 'rgba(5,5,5,0.4)', 'rgba(5,5,5,0.82)', Colors.primary.cardBlack]} locations={[0, 0.45, 0.85, 1]} style={StyleSheet.absoluteFill} />
                    <View style={styles.previewCopy}><Text style={styles.previewName}>{name || '내 프로필'}</Text><Text style={styles.previewCaption}>사진 위에 프로필 정보가 표시돼요</Text></View>
                  </>
                )}
                {mode === 'card' && <View style={{ position: 'absolute', right: 12, bottom: 12, padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' }}><Feather name="chevron-right" size={20} color="#fff" /></View>}
              </View>
              {mode === 'card' && <Text style={[styles.title, { color: colors.text.primary }]}>{name || '내 프로필'}</Text>}
              <Text style={[styles.caption, { color: colors.text.secondary }]}>추천 카드와 원형 사진은 가운데를 기준으로 잘려요.</Text>
            </>
          ) : (
            <>
              <View {...pan.panHandlers} style={[styles.frame, { width: frame.width, height: frame.height }]} accessibilityLabel="프로필 사진 크롭 영역">
                <Image key={source.uri} source={{ uri: source.uri }} contentFit="fill" onError={() => { if (sourceUri.current === source.uri) setSourceFailed(true); }} style={{ position: 'absolute', width: source.width * scale, height: source.height * scale, left: (frame.width - source.width * scale) / 2 + transform.x, top: (frame.height - source.height * scale) / 2 + transform.y }} />
                <View pointerEvents="none" style={styles.guide} />
              </View>
              <View style={styles.livePreviews}>
                <View style={styles.livePreviewItem}>
                  <CroppedPhotoPreview photo={source} crop={crop} width={miniCardWidth} height={miniCardWidth * 3 / 4} label="추천 카드 실시간 미리보기" />
                  <Text style={[styles.caption, { color: colors.text.secondary }]}>추천 카드</Text>
                </View>
                <View style={styles.livePreviewItem}>
                  <CroppedPhotoPreview photo={source} crop={crop} width={72} height={72} round label="원형 사진 실시간 미리보기" />
                  <Text style={[styles.caption, { color: colors.text.secondary }]}>원형 사진</Text>
                </View>
              </View>
              <View style={styles.tabs}>
                <Pressable onPress={() => adjust({ ...transformRef.current, zoom: transformRef.current.zoom - 0.25 })} disabled={busy} accessibilityRole="button" accessibilityLabel="사진 축소" style={styles.iconButton}><Feather name="minus" size={22} color={colors.text.primary} /></Pressable>
                <Pressable onPress={() => adjust(identity)} disabled={busy} accessibilityRole="button" style={styles.resetButton}><Text style={[styles.controlText, { color: colors.text.primary }]}>처음 구도로</Text></Pressable>
                <Pressable onPress={() => adjust({ ...transformRef.current, zoom: transformRef.current.zoom + 0.25 })} disabled={busy} accessibilityRole="button" accessibilityLabel="사진 확대" style={styles.iconButton}><Feather name="plus" size={22} color={colors.text.primary} /></Pressable>
              </View>
              <Pressable onPress={rotate} disabled={busy} accessibilityRole="button" accessibilityLabel="사진 90도 회전" accessibilityState={{ disabled: busy }} style={[styles.rotateButton, { borderColor: colors.border.primary }]}>
                <Feather name="rotate-cw" size={18} color={colors.text.primary} />
                <Text style={[styles.controlText, { color: colors.text.primary }]}>90도 회전</Text>
              </Pressable>
            </>
          )}
          {prepared && <View style={[styles.notice, { backgroundColor: colors.background.card }]}>
            <Feather name="eye" size={16} color={colors.text.secondary} />
            <Text style={[styles.noticeText, { color: colors.text.secondary }]}>등록하면 추천 카드·프로필·채팅에 보여요. 나중에 바꾸거나 삭제할 수 있어요.</Text>
          </View>}
          {sourceFailed && <Text accessibilityRole="alert" style={[styles.help, { color: colors.state.danger }]}>사진을 읽을 수 없어요. 돌아가서 다른 사진을 선택해 주세요.</Text>}
          {error && <Text accessibilityRole="alert" style={[styles.help, { color: colors.state.danger }]}>{error}</Text>}
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: colors.border.primary }]}>
          {busy ? <View style={styles.busy}>
            <View style={styles.busyHeading}><ActivityIndicator color={colors.brand.accent} /><Text style={[styles.busyText, { color: colors.text.primary }]}>{stageText}</Text></View>
            {save.stage === 'upload' && uploadPercent !== null && <>
              <Text style={[styles.controlText, { color: colors.brand.accent }]}>{uploadPercent}% 전송</Text>
              <View accessible accessibilityRole="progressbar" accessibilityLabel="프로필 사진 전송 진행률" accessibilityValue={{ min: 0, max: 100, now: uploadPercent }} style={[styles.progressTrack, { backgroundColor: colors.background.glass }]}>
                <View style={[styles.progressFill, { width: `${uploadPercent}%`, backgroundColor: colors.brand.accent }]} />
              </View>
            </>}
          </View> : (
            <>
              {prepared && <Pressable onPress={backToCrop} accessibilityRole="button" style={styles.secondary}><Text style={[styles.controlText, { color: colors.text.primary }]}>구도 다시 맞추기</Text></Pressable>}
              <Pressable onPress={prepared ? submit : preview} disabled={sourceFailed} accessibilityRole="button" accessibilityState={{ disabled: sourceFailed }} style={[styles.primary, { backgroundColor: colors.brand.accent, opacity: sourceFailed ? 0.5 : 1 }]}>
                <Text style={[styles.primaryText, { color: isDark ? '#111' : '#fff' }]}>{prepared ? (error ? '사진 등록 다시 시도' : '사진 등록') : '미리보기 확인'}</Text>
              </Pressable>
              <Pressable onPress={close} accessibilityRole="button" style={styles.secondary}><Text style={[styles.controlText, { color: colors.text.secondary }]}>나중에 등록할게요</Text></Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.md },
  heading: { flex: 1, gap: Spacing.xs }, step: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 18, fontWeight: FontWeight.medium },
  title: { fontFamily: FontFamily.sans, fontSize: 22, lineHeight: 30, fontWeight: FontWeight.semibold }, iconButton: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  resetButton: { minHeight: 48, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl },
  help: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, textAlign: 'center' },
  caption: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 20, textAlign: 'center' }, frame: { overflow: 'hidden', backgroundColor: '#111', borderRadius: Radii.lg },
  guide: { position: 'absolute', top: '20%', left: '20%', width: '60%', height: '60%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 100 },
  tabs: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }, tab: { minHeight: 48, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderWidth: 1, borderRadius: Radii.md, justifyContent: 'center' },
  controlText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, fontWeight: FontWeight.medium },
  previewCopy: { position: 'absolute', bottom: 20, left: 20, right: 20 }, previewName: { fontFamily: FontFamily.sans, color: '#fff', fontSize: 24, fontWeight: FontWeight.semibold }, previewCaption: { fontFamily: FontFamily.sans, color: '#ddd', fontSize: 13, lineHeight: 20, marginTop: Spacing.sm },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radii.md }, noticeText: { fontFamily: FontFamily.sans, flex: 1, fontSize: 13, lineHeight: 20 },
  footer: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm, gap: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth }, primary: { padding: Spacing.lg, minHeight: 52, borderRadius: Radii.lg, alignItems: 'center', justifyContent: 'center' }, primaryText: { fontFamily: FontFamily.sans, fontWeight: FontWeight.semibold, fontSize: FontSize.lg, lineHeight: 24 },
  secondary: { padding: Spacing.sm, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, busy: { gap: Spacing.sm, padding: Spacing.lg, minHeight: 96, justifyContent: 'center', alignItems: 'center' },
  busyHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, busyText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, fontWeight: FontWeight.medium, flexShrink: 1 },
  progressTrack: { width: '100%', height: 6, borderRadius: Radii.full, overflow: 'hidden' }, progressFill: { height: '100%' },
  livePreviews: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.xxl }, livePreviewItem: { alignItems: 'center', gap: Spacing.sm },
  rotateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, minHeight: 48, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderWidth: 1, borderRadius: Radii.md },
});
