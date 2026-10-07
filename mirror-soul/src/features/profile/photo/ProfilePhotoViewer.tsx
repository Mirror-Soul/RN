import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { PROFILE_PHOTO_ASPECT } from './photoGeometry';

export function ProfilePhotoViewer({ uri, previewUri, name, onClose, onChange, onDelete, onRetry, disabled = false }: {
  uri: string; previewUri?: string | null; name: string; onClose: () => void; onChange: () => void; onDelete: () => void; onRetry?: () => void; disabled?: boolean;
}) {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const width = Math.max(160, Math.min(window.width - 40, 440, (window.height - insets.top - insets.bottom - 280) * PROFILE_PHOTO_ASPECT));
  const [visible, setVisible] = useState(true);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [previewFailed, setPreviewFailed] = useState(false);
  const hasPreview = !!previewUri && !previewFailed;
  const activeAttempt = useRef(0);
  const currentUri = useRef(uri);
  currentUri.current = uri;
  const previousUri = useRef(uri);
  const afterClose = useRef<(() => void) | undefined>(undefined);
  const closed = useRef(false);
  useEffect(() => {
    if (previousUri.current === uri) return;
    previousUri.current = uri;
    activeAttempt.current += 1;
    setAttempt(activeAttempt.current);
    setState('loading');
    setPreviewFailed(false);
  }, [uri]);
  useEffect(() => { setPreviewFailed(false); }, [previewUri]);
  const finishClose = () => {
    if (closed.current) return;
    closed.current = true;
    onClose();
    afterClose.current?.();
  };
  // iOS는 Modal이 실제 닫힌 뒤 Alert/사진 선택기를 띄워야 한다.
  // Android는 onDismiss가 제공되지 않으므로 애니메이션 없이 닫고 commit 후 처리한다.
  useEffect(() => {
    if (!visible && Platform.OS !== 'ios') finishClose();
  });
  const close = (next?: () => void) => {
    if (!visible || closed.current) return;
    afterClose.current = next;
    setVisible(false);
  };
  const retry = () => {
    activeAttempt.current += 1;
    setAttempt(activeAttempt.current);
    setState('loading');
    onRetry?.();
  };
  return (
    <Modal visible={visible} animationType={Platform.OS === 'ios' ? 'fade' : 'none'} onDismiss={finishClose} onRequestClose={() => close()}>
      <View style={[styles.root, { backgroundColor: colors.background.primary, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>내 프로필 사진</Text>
          <Pressable onPress={() => close()} accessibilityRole="button" accessibilityLabel="프로필 사진 크게 보기 닫기" style={styles.closeButton}><Feather name="x" size={24} color={colors.text.primary} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.frame, { width, height: width / PROFILE_PHOTO_ASPECT, backgroundColor: colors.background.card }]}>
            {state === 'error' && !hasPreview ? <View style={styles.message}>
              <Feather name="image" size={32} color={colors.text.muted} />
              <Text style={[styles.copy, { color: colors.text.secondary }]}>사진은 등록되어 있어요.{'\n'}잠시 불러오지 못했어요.</Text>
              <Pressable onPress={retry} accessibilityRole="button" accessibilityLabel="등록한 프로필 사진 다시 불러오기" style={[styles.retry, { borderColor: colors.border.primary }]}><Text style={[styles.buttonText, { color: colors.brand.accent }]}>다시 불러오기</Text></Pressable>
            </View> : <>
              {hasPreview && state !== 'loaded' && <Image source={{ uri: previewUri! }} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityLabel={`${name || '내 프로필'}의 등록 직후 사진 미리보기`} onError={() => setPreviewFailed(true)} />}
              {state !== 'error' && <Image key={`${uri}:${attempt}`} source={{ uri }} style={[StyleSheet.absoluteFill, { opacity: state === 'loaded' ? 1 : 0 }]} contentFit="contain" accessibilityLabel={`${name || '내 프로필'}의 등록한 사진`}
                onLoad={() => { if (currentUri.current === uri && activeAttempt.current === attempt) setState('loaded'); }}
                onError={() => { if (currentUri.current === uri && activeAttempt.current === attempt) { activeAttempt.current += 1; setState('error'); } }} />}
              {state === 'loading' && !hasPreview && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.message, { backgroundColor: colors.background.card }]}><ActivityIndicator color={colors.brand.accent} /><Text style={[styles.copy, { color: colors.text.secondary }]}>사진을 불러오고 있어요…</Text></View>}
            </>}
          </View>
          {state === 'error' && hasPreview && <>
            <Text accessibilityRole="alert" style={[styles.copy, { color: colors.text.secondary }]}>방금 등록한 사진을 미리 보여드리고 있어요. 등록된 사진을 다시 불러와 확인해주세요.</Text>
            <Pressable onPress={retry} accessibilityRole="button" accessibilityLabel="등록한 프로필 사진 다시 불러오기" style={[styles.retry, { borderColor: colors.border.primary }]}><Text style={[styles.buttonText, { color: colors.brand.accent }]}>다시 불러오기</Text></Pressable>
          </>}
          <Text style={[styles.copy, { color: colors.text.secondary }]}>사진을 바꾸면 원본을 다시 선택해 구도를 맞출 수 있어요.</Text>
          <Pressable disabled={disabled} onPress={() => close(onChange)} accessibilityRole="button" accessibilityState={{ disabled }} style={[styles.action, { borderColor: colors.border.primary, backgroundColor: colors.background.glass, opacity: disabled ? 0.5 : 1 }]}>
            <Feather name="camera" size={18} color={colors.brand.accent} /><Text style={[styles.buttonText, { color: colors.brand.accent }]}>사진 바꾸기</Text>
          </Pressable>
          <Pressable disabled={disabled} onPress={() => close(onDelete)} accessibilityRole="button" accessibilityState={{ disabled }} style={[styles.action, { borderColor: colors.border.primary, opacity: disabled ? 0.5 : 1 }]}>
            <Feather name="trash-2" size={18} color={colors.state.danger} /><Text style={[styles.buttonText, { color: colors.state.danger }]}>사진 삭제</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.xxl, lineHeight: 28, fontWeight: FontWeight.semibold, flexShrink: 1 }, closeButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.xl, gap: Spacing.lg, alignItems: 'center' }, frame: { borderRadius: Radii.lg, overflow: 'hidden' }, message: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.md },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, textAlign: 'center' }, buttonText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22, fontWeight: FontWeight.semibold, flexShrink: 1, textAlign: 'center' },
  action: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, minHeight: 48, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md }, retry: { minHeight: 48, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, justifyContent: 'center' },
});
