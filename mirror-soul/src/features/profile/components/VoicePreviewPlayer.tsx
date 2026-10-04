import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useAudioSettingsQuery } from '@/src/features/voice-audio/hooks/useAudioSettingsQuery';
import { normalizedPlaybackVolume } from '@/src/features/voice-audio/playbackVolume';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';
import { formatDurationLabel } from '@/src/utils/formatCallTime';
import type { IntroductionVoicePreview } from '@/src/types/api/profile';

interface Props {
  voicePreview: IntroductionVoicePreview;
  onReload?: () => Promise<unknown> | void;
  isReloading?: boolean;
}

/** URL 교체 시 이전 플레이어를 재사용하지 않는다. release는 expo-audio 훅에 맡긴다. */
export function VoicePreviewPlayer(props: Props) {
  const [attempt, setAttempt] = useState(0);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const latestUrl = useRef(props.voicePreview.audioUrl);
  latestUrl.current = props.voicePreview.audioUrl;
  const reload = props.onReload ? async () => {
    await props.onReload?.();
    if (alive.current && latestUrl.current === props.voicePreview.audioUrl) setAttempt(value => value + 1);
  } : undefined;
  return <Player key={`${props.voicePreview.audioUrl}:${attempt}`} {...props} onReload={reload} />;
}

function Player({ voicePreview, onReload, isReloading = false }: Props) {
  const { colors } = useThemeColors();
  const player = useAudioPlayer(voicePreview.audioUrl);
  const status = useAudioPlayerStatus(player);
  const audioSettings = useAudioSettingsQuery();
  const volume = normalizedPlaybackVolume(audioSettings.data?.opponentVoiceVolume);
  useEffect(() => { try { player.volume = volume; } catch { /* URL 교체로 이미 해제된 경우 */ } }, [player, volume]);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(true);
  const focused = useRef(true);
  const foreground = useRef(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const pause = useCallback(() => {
    // 네이티브 객체가 먼저 해제된 경우에도 화면 전환을 막지 않는다.
    try { player.pause(); } catch { /* 이미 정리된 플레이어 */ }
  }, [player]);
  useFocusEffect(useCallback(() => { focused.current = true; return () => { focused.current = false; pause(); }; }, [pause]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { foreground.current = state === 'active'; if (!foreground.current) pause(); });
    return () => subscription.remove();
  }, [pause]);
  const loading = !status.isLoaded || status.isBuffering;
  const failed = error || status.playbackState === 'failed' || status.playbackState === 'error';
  useEffect(() => {
    if (!loading || failed) return;
    const timeout = setTimeout(() => { pause(); setError(true); }, 15_000);
    return () => clearTimeout(timeout);
  }, [loading, failed, pause]);
  const toggle = async () => {
    if (lock.current || loading || failed || isReloading) return;
    lock.current = true;
    setBusy(true);
    try {
      if (status.playing) pause();
      else {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true, shouldRouteThroughEarpiece: false });
        if (!mounted.current || !focused.current || !foreground.current) return;
        if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.05)) await player.seekTo(0);
        if (mounted.current && focused.current && foreground.current) player.play();
      }
    } catch { if (mounted.current) setError(true); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  const reload = async () => {
    if (lock.current || isReloading || !onReload) return;
    lock.current = true;
    setBusy(true);
    pause();
    try { await onReload(); }
    catch { if (mounted.current) setError(true); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  return (
    <View style={styles.content}>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>{formatDurationLabel(voicePreview.durationMs == null ? null : Math.round(voicePreview.durationMs / 1000))}</Text>
      {volume === 0 && <Text style={[styles.copy, { color: colors.text.secondary }]}>소리가 꺼져 있어요. 통화 소리 설정에서 목소리 크기를 올려 주세요.</Text>}
      {failed && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>음성을 불러오지 못했어요. 다시 불러와 주세요.</Text>}
      <View style={styles.actions}>
        <Pressable onPress={() => { void toggle(); }} disabled={loading || failed || busy || isReloading} accessibilityRole="button" accessibilityState={{ disabled: loading || failed || busy || isReloading }} accessibilityLabel={status.playing ? '음성 미리듣기 일시정지' : '음성 미리듣기 재생'} style={[styles.button, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
          {loading && !failed ? <ActivityIndicator color={colors.brand.accent} /> : <Feather name={status.playing ? 'pause' : 'play'} size={18} color={colors.brand.accent} />}
          <Text style={[styles.copy, { color: colors.text.primary }]}>{failed ? '재생할 수 없어요' : loading ? '음성 불러오는 중…' : status.playing ? '일시정지' : '음성 미리듣기'}</Text>
        </Pressable>
        {onReload && <Pressable onPress={() => { void reload(); }} disabled={busy || isReloading} accessibilityRole="button" accessibilityLabel="음성 미리듣기 다시 불러오기" accessibilityState={{ disabled: busy || isReloading }} style={[styles.button, { borderColor: colors.border.primary }]}>
          {isReloading ? <ActivityIndicator color={colors.brand.accent} /> : <Feather name="refresh-cw" size={16} color={colors.brand.accent} />}
          <Text style={[styles.copy, { color: colors.brand.accent }]}>다시 불러오기</Text>
        </Pressable>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: Spacing.sm },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20, flexShrink: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  button: { minHeight: 48, padding: Spacing.sm, borderWidth: 1, borderRadius: Radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, flexShrink: 1, maxWidth: '100%' },
});
