import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export type ProfilePhotoLoadState = 'empty' | 'loading' | 'loaded' | 'error';
interface ProfilePhotoProps {
  uri?: string | null;
  name: string;
  size?: number;
  onLoadStateChange?: (state: ProfilePhotoLoadState) => void;
  onPress?: () => void;
  previewUri?: string | null;
  onRetry?: () => void;
}

/** URL을 키로 삼아 교체 후 이전 다운로드 오류가 새 사진에 남지 않게 한다. */
export function ProfilePhoto(props: ProfilePhotoProps) {
  return <PhotoContent key={props.uri ?? 'empty'} {...props} size={props.size ?? 64} />;
}
function PhotoContent({ uri, name, size, onLoadStateChange, onPress, previewUri, onRetry }: ProfilePhotoProps & { size: number }) {
  const { colors } = useThemeColors();
  const [state, setState] = useState<ProfilePhotoLoadState>(uri ? 'loading' : 'empty');
  const [attempt, setAttempt] = useState(0);
  const activeAttempt = useRef(0);
  const [previewFailed, setPreviewFailed] = useState(false);
  const hasPreview = !!uri && !!previewUri && !previewFailed;
  useEffect(() => { setPreviewFailed(false); }, [previewUri]);
  useEffect(() => { onLoadStateChange?.(state); }, [state, onLoadStateChange]);
  const retry = () => {
    activeAttempt.current += 1;
    setAttempt(activeAttempt.current);
    setState('loading');
    onRetry?.();
  };
  const label = `${name || '회원'}의 프로필 사진`;
  const frame = { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' as const, backgroundColor: colors.background.card };
  if (state === 'error' && !hasPreview) {
    return (
      <Pressable onPress={retry} accessibilityRole="button" accessibilityLabel="프로필 사진 다시 불러오기" accessibilityHint="등록된 사진의 다운로드를 다시 시도해요" style={[frame, styles.fallback, { borderWidth: 1, borderColor: colors.border.primary }]}>
        <Feather name="refresh-cw" size={Math.min(22, size / 3)} color={colors.text.secondary} />
      </Pressable>
    );
  }
  const content = uri ? <>
    {hasPreview && state !== 'loaded' && <Image key={previewUri} source={{ uri: previewUri! }} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} onError={() => setPreviewFailed(true)} />}
    {state !== 'error' && <Image key={attempt} source={{ uri }} style={[StyleSheet.absoluteFill, { opacity: state === 'loaded' ? 1 : 0 }]} contentFit="cover" accessible={false}
      onLoad={() => { if (activeAttempt.current === attempt) setState('loaded'); }}
      onError={() => { if (activeAttempt.current === attempt) { activeAttempt.current += 1; setState('error'); } }} />}
    {state === 'loading' && !hasPreview && <View style={[StyleSheet.absoluteFill, styles.fallback, { backgroundColor: colors.background.card }]} pointerEvents="none"><ActivityIndicator color={colors.brand.accent} /></View>}
  </> : (
    <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={[StyleSheet.absoluteFill, styles.fallback]}><Text style={[styles.initial, { fontSize: size / 3 }]}>{Array.from(name.trim())[0] || '나'}</Text></LinearGradient>
  );
  if (uri && onPress) return (
    <Pressable style={frame} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label} 크게 보기`} accessibilityHint="등록한 사진을 크게 보고 변경하거나 삭제할 수 있어요">
      {content}
    </Pressable>
  );
  return <View style={frame} accessible accessibilityRole="image" accessibilityLabel={state === 'loading' ? `${label} 불러오는 중` : state === 'empty' ? `${name || '회원'}의 기본 프로필 이미지` : label}>{content}</View>;
}
const styles = StyleSheet.create({ fallback: { alignItems: 'center', justifyContent: 'center' }, initial: { fontFamily: FontFamily.sans, color: Colors.primary.vividPurple, fontWeight: '700' } });
