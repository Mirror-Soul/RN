import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Alert, AppState, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import InterviewVisualizer from './InterviewVisualizer';

export function formatRecordingTime(durationMs: number) {
  const seconds = Math.max(0, Math.floor(durationMs / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
interface Props {
  isRecording: boolean;
  isBusy: boolean;
  isListening: boolean;
  transcript: string;
  hasRecognizedSpeech: boolean;
  recordingUri?: string;
  durationMs: number;
  metering?: number;
  recognitionIssue?: string | null;
  onChangeText: (text: string) => void;
}
export default function InterviewAnswerBox({ isRecording, isBusy, isListening, transcript, hasRecognizedSpeech, recordingUri, durationMs, metering, recognitionIssue, onChangeText }: Props) {
  const { colors } = useThemeColors();
  const [isEditing, setIsEditing] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  return <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
    <View style={styles.heading}>
      <Text style={[styles.title, { color: colors.text.primary }]}>{isRecording ? '편하게 이야기해주세요' : '내가 들려준 이야기'}</Text>
      <Text style={[styles.timer, { color: isRecording ? colors.state.danger : colors.text.secondary }]}>{formatRecordingTime(durationMs)}</Text>
    </View>
    {isRecording ? <>
      <InterviewVisualizer isRecording metering={metering} />
      <Text style={[styles.copy, { color: colors.text.secondary }]}>한 질문에 약 20초면 좋아요. 생각할 시간이 필요하면 잠깐 쉬어도 괜찮아요.</Text>
      {!transcript && durationMs >= 8000 && <Text style={[styles.copy, { color: colors.text.secondary }]}>아직 인식된 말이 없어요. 목소리가 잘 잡히는지 확인해주세요.</Text>}
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showCaptions }} onPress={() => setShowCaptions(value => !value)} style={styles.action}>
        <Feather name={showCaptions ? 'chevron-up' : 'chevron-down'} size={17} color={colors.text.secondary} />
        <Text style={[styles.actionText, { color: colors.text.secondary }]}>{showCaptions ? '인식되는 문장 접기' : '인식되는 문장 보기'}</Text>
      </Pressable>
      {showCaptions && <Text style={[styles.answer, { color: colors.text.primary }]}>{transcript || (isListening ? '말씀하시면 여기에 나타나요.' : '음성 인식을 준비하고 있어요…')}</Text>}
    </> : <>
      <Text style={[styles.copy, { color: colors.text.secondary }]}>{hasRecognizedSpeech
        ? '내가 말한 내용이 맞으면 바로 저장해주세요. 다르게 적힌 부분만 고쳐도 좋아요.'
        : '목소리로 답변해주셔야 다음으로 넘어갈 수 있어요. 아래에서 다시 녹음해주세요.'}</Text>
      {recognitionIssue && <View accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor: colors.background.glass }]}>
        <Text style={[styles.copy, { color: colors.text.primary }]}>{recognitionIssue}</Text>
        {hasRecognizedSpeech && <Text style={[styles.copy, { color: colors.text.secondary }]}>재녹음을 권해요. 내용이 맞다면 확인 후 저장할 수 있어요.</Text>}
      </View>}
      {isEditing && hasRecognizedSpeech ? <>
        <TextInput accessibilityLabel="인식된 답변 수정" multiline value={transcript} onChangeText={onChangeText} editable={!isBusy} autoFocus
          placeholder="녹음에서 말한 내용을 적어주세요." placeholderTextColor={colors.text.muted}
          style={[styles.input, { color: colors.text.primary, borderColor: colors.border.strong, backgroundColor: colors.background.glass }]} />
        <Text style={[styles.copy, { color: colors.text.secondary }]}>문장을 고쳐도 녹음은 바뀌지 않아요. 주변 대화가 섞였다면 다시 녹음해주세요.</Text>
      </> : <Text selectable style={[styles.answer, { color: transcript ? colors.text.primary : colors.text.secondary }]}>
        {hasRecognizedSpeech
          ? transcript || '답변이 비어 있어요. 녹음에서 말한 내용을 확인해주세요.'
          : '말한 내용을 인식하지 못했어요. 조용한 곳에서 휴대폰을 가까이 두고 다시 녹음해주세요.'}
      </Text>}
      <View style={styles.actions}>
        {hasRecognizedSpeech && <Pressable accessibilityRole="button" disabled={isBusy} accessibilityState={{ disabled: isBusy }} onPress={() => setIsEditing(value => !value)} style={styles.action}>
          <Feather name={isEditing ? 'check' : 'edit-3'} size={17} color={colors.text.secondary} />
          <Text style={[styles.actionText, { color: colors.text.secondary }]}>{isEditing ? '수정 마치기' : '문장 수정'}</Text>
        </Pressable>}
        {recordingUri && <RecordingPlayback uri={recordingUri} disabled={isBusy} />}
      </View>
    </>}
  </View>;
}

function RecordingPlayback({ uri, disabled }: { uri: string; disabled: boolean }) {
  const { colors } = useThemeColors();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const lifecycle = useMemo(() => ({ player, mounted: false, focused: false }), [player]);
  const lock = useRef(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  useLayoutEffect(() => {
    lifecycle.mounted = true;
    // useAudioPlayer releases its native object in passive cleanup. Mark it inactive first.
    return () => { lifecycle.mounted = false; lifecycle.focused = false; };
  }, [lifecycle]);
  const pauseIfMounted = useCallback(() => {
    if (lifecycle.mounted) lifecycle.player.pause();
  }, [lifecycle]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => { if (next !== 'active') pauseIfMounted(); });
    return () => subscription.remove();
  }, [pauseIfMounted]);
  useFocusEffect(useCallback(() => {
    lifecycle.focused = true;
    return () => { lifecycle.focused = false; pauseIfMounted(); };
  }, [lifecycle, pauseIfMounted]));
  useEffect(() => { if (disabled) pauseIfMounted(); }, [disabled, pauseIfMounted]);
  const toggle = async () => {
    if (lock.current || disabled || !lifecycle.mounted || !lifecycle.focused) return;
    lock.current = true;
    try {
      if (status.playing) { pauseIfMounted(); return; }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      if (!lifecycle.mounted || !lifecycle.focused || disabledRef.current || AppState.currentState !== 'active') return;
      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) await player.seekTo(0);
      if (lifecycle.mounted && lifecycle.focused && !disabledRef.current && AppState.currentState === 'active') player.play();
    } catch { if (lifecycle.mounted && lifecycle.focused) Alert.alert('녹음을 재생하지 못했어요', '잠시 후 다시 눌러주세요.'); }
    finally { lock.current = false; }
  };
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} accessibilityLabel={status.playing ? '녹음 일시정지' : '녹음 듣기'} disabled={disabled} onPress={() => void toggle()} style={styles.action}>
    <Feather name={status.playing ? 'pause' : 'play'} size={17} color={colors.text.secondary} />
    <Text style={[styles.actionText, { color: colors.text.secondary }]}>{status.playing ? '일시정지' : '녹음 듣기'}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  card: { width: '100%', padding: Spacing.xl, borderRadius: Radii.lg2, borderWidth: 1, gap: Spacing.md },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  title: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: 24, flexShrink: 1 },
  timer: { fontFamily: FontFamily.mono, fontSize: FontSize.base, lineHeight: 22 },
  copy: { fontFamily: FontFamily.sans, fontSize: FontSize.base, lineHeight: 22 },
  answer: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 26 },
  input: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, lineHeight: 26, minHeight: 120, padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  action: { minHeight: 44, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  actionText: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.medium, lineHeight: 22, flexShrink: 1 },
  notice: { padding: Spacing.md, borderRadius: Radii.md, gap: Spacing.sm },
});
