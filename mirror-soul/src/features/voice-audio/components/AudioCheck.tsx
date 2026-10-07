import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { FontFamily, FontSize, Radii, Spacing } from '@/src/constants/theme';
import { normalizedPlaybackVolume } from '../playbackVolume';

/** 네트워크·통화 시간 차감 없이 앱에 포함된 한국어 안내 음성을 재생한다. */
export function AudioCheck({ volume }: { volume: number | null }) {
  const [attempt, setAttempt] = useState(0);
  return <CheckPlayer key={attempt} volume={volume} onRetry={() => setAttempt(value => value + 1)} />;
}

function CheckPlayer({ volume, onRetry }: { volume: number | null; onRetry: () => void }) {
  const { colors } = useThemeColors();
  const player = useAudioPlayer(require('@/assets/audio/audio-check.mp3'));
  const status = useAudioPlayerStatus(player);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);
  const focused = useRef(true);
  const foreground = useRef(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const lock = useRef(false);
  const pause = useCallback(() => { try { player.pause(); } catch { /* 이미 해제된 경우 */ } }, [player]);
  useEffect(() => { try { player.volume = normalizedPlaybackVolume(volume); } catch { /* 화면 전환 */ } }, [player, volume]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useFocusEffect(useCallback(() => {
    focused.current = true;
    return () => { focused.current = false; pause(); };
  }, [pause]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { foreground.current = state === 'active'; if (!foreground.current) pause(); });
    return () => subscription.remove();
  }, [pause]);
  const failed = error || status.playbackState === 'failed' || status.playbackState === 'error';
  useEffect(() => {
    if (status.isLoaded || failed) return;
    const timer = setTimeout(() => setError(true), 10_000);
    return () => clearTimeout(timer);
  }, [status.isLoaded, failed]);
  const play = async () => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      if (status.playing) pause();
      else {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true, shouldRouteThroughEarpiece: false });
        if (!alive.current || !focused.current || !foreground.current) return;
        await player.seekTo(0);
        if (alive.current && focused.current && foreground.current) player.play();
      }
    } catch { if (alive.current) setError(true); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  };
  const disabled = volume == null || volume === 0 || busy || (!status.isLoaded && !failed);
  return <View style={styles.content}>
    <Text style={[styles.copy, { color: colors.text.secondary }]}>안내 음성을 들으며 지금 연결된 이어폰이나 스피커의 소리 크기를 맞춰보세요.</Text>
    <Text style={[styles.copy, { color: colors.text.muted }]}>AI 안내 음성 · 약 9초{ '\n' }통화 시간은 사용하지 않아요.</Text>
    {failed && <Text accessibilityRole="alert" style={[styles.copy, { color: colors.state.danger }]}>안내 음성을 재생하지 못했어요. 다시 시도해 주세요.</Text>}
    {volume === 0 && <Text style={[styles.copy, { color: colors.text.secondary }]}>목소리 크기를 올린 뒤 소리를 확인해 주세요.</Text>}
    <Pressable disabled={disabled} onPress={() => { if (failed) onRetry(); else void play(); }} accessibilityRole="button" accessibilityLabel={failed ? '소리 테스트 다시 시도' : status.playing ? '소리 테스트 정지' : '소리 테스트'} accessibilityState={{ disabled }} style={[styles.button, { borderColor: colors.border.primary, opacity: disabled ? 0.5 : 1 }]}>
      {!status.isLoaded && !failed ? <ActivityIndicator color={colors.brand.accent} /> : <Feather name={status.playing ? 'square' : 'play'} size={18} color={colors.brand.accent} />}
      <Text style={[styles.copy, { color: colors.brand.accent }]}>{failed ? '다시 시도' : status.playing ? '정지' : '소리 테스트'}</Text>
    </Pressable>
    <Text style={[styles.copy, { color: colors.text.muted }]}>통화는 이 안내 음성과 소리 크기가 다를 수 있어요. 통화 중 볼륨 버튼으로 맞추고, 작다면 ‘작은 통화 음성 키우기’를 사용해 주세요.</Text>
  </View>;
}

const styles = StyleSheet.create({
  content: { gap: Spacing.md },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 21, flexShrink: 1 },
  button: { minHeight: 48, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});
