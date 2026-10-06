import VoiceUpdateButton, { VoiceUpdateStatus } from '@/src/components/home/grow/voice-update/VoiceUpdateButton';
import VoiceUpdatePrompt from '@/src/components/home/grow/voice-update/VoiceUpdatePrompt';
import GrowSubScreenHeader from '@/src/components/home/grow/GrowSubScreenHeader';
import VoiceUpdateTranscriptBox from '@/src/components/home/grow/voice-update/VoiceUpdateTranscriptBox';
import { useVoiceRecording } from '@/src/components/home/grow/voice-update/hooks/useVoiceRecording';
import { useVoiceTrainingCooldown } from '@/src/components/home/grow/voice-update/hooks/useVoiceTrainingCooldown';
import { useCompleteVoiceTrainingMutation } from '@/src/features/growth/hooks/useCompleteVoiceTrainingMutation';
import { useVoiceTrainingSentenceQuery } from '@/src/features/growth/hooks/useVoiceTrainingSentenceQuery';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import { useSTT } from '@/src/hooks/useSTT';
import { Spacing } from '@/src/constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { logger } from '@/src/utils/logger';
import { BrowseText as Text } from '@/src/components/home/common/BrowseText';
import { Feather } from '@expo/vector-icons';
import { MIN_READING_SIMILARITY, readingSimilarity } from '@/src/components/home/grow/voice-update/readingSimilarity';

/**
 * 목소리 업데이트 화면
 * 실시간 STT(자막 표시용)와 별도로 expo-audio로 실제 업로드용 오디오 파일을 녹음하고,
 * 녹음 종료 시 presigned URL 업로드 + POST /evolve/voice로 학습 Job을 등록한다.
 */
export default function VoiceUpdateScreen() {
  const { contentContainerStyle } = useLayout();
  const { colors } = useThemeColors();
  const [status, setStatus] = useState<VoiceUpdateStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [acceptedAt, setAcceptedAt] = useState<number>();
  const [readingCheck, setReadingCheck] = useState<{ transcript: string; similarity: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const operation = useRef(0);
  const statusRef = useRef<VoiceUpdateStatus>('idle');
  const recordingSentence = useRef<{ sentenceId: number; speechLine: string } | null>(null);
  const transition = (next: VoiceUpdateStatus) => {
    statusRef.current = next;
    if (mounted.current) setStatus(next);
  };

  const sentenceQuery = useVoiceTrainingSentenceQuery();
  const voiceRecording = useVoiceRecording();
  const completeMutation = useCompleteVoiceTrainingMutation();

  // 그로우 탭 미션 카드와 같은 쿼리키를 써서 캐시를 공유한다(추가 네트워크 호출 없음).
  // 마지막 학습 시각을 기준으로 2분 쿨다운이 남았으면, 녹음+STT+업로드를 다 끝낸 뒤
  // 백엔드 429로 실패하는 대신 녹음 시작 전에 미리 막는다.
  // pending(최초 로딩)과 error(조회 실패)를 하나로 합치면, 조회가 실패했을 때 이 화면
  // 안에서 다시 시도할 방법이 없어 버튼이 영구적으로 막힌 채 남는다 — 별도로 넘긴다.
  const twinSyncQuery = useTwinSyncQuery();
  const { isInCooldown, remainingSeconds } = useVoiceTrainingCooldown(twinSyncQuery.data?.lastVoiceTrainingAt, acceptedAt);

  // STT 훅 연동 (실시간 자막 표시용 — 업로드용 오디오 파일은 useVoiceRecording이 별도로 녹음)
  const { transcript, startListening, stopListening, resetTranscript } = useSTT('ko-KR');

  const handlePress = () => {
    if (statusRef.current === 'idle') void startRecording();
    else if (statusRef.current === 'recording') void stopRecording();
  };

  const startRecording = async () => {
    if (lock.current || statusRef.current !== 'idle' || !sentenceQuery.data?.speechLine?.trim() || sentenceQuery.isError || sentenceQuery.isPending || sentenceQuery.isFetching || isInCooldown || twinSyncQuery.isPending || twinSyncQuery.isError) return;
    lock.current = true;
    recordingSentence.current = readingCheck ? recordingSentence.current ?? sentenceQuery.data : sentenceQuery.data;
    const attempt = ++operation.current;
    let audioStarted = false;
    transition('starting');
    try {
      setElapsed(0);
      setReadingCheck(null);
      resetTranscript();

      if (!voiceRecording.hasPermission) {
        const granted = await voiceRecording.requestPermission();
        if (!mounted.current || attempt !== operation.current) return;
        if (!granted) {
          transition('idle');
          Alert.alert('마이크 사용을 허용해주세요', '목소리를 녹음하려면 마이크 권한이 필요해요. 휴대폰 설정에서 변경할 수 있어요.', [
            { text: '나중에', style: 'cancel' },
            { text: '기기 설정 열기', onPress: () => { void Linking.openSettings().catch(() => Alert.alert('설정을 열지 못했어요', '휴대폰 설정에서 Mirror Soul의 마이크 권한을 확인해주세요.')); } },
          ]);
          return;
        }
      }

      await voiceRecording.startRecording();
      audioStarted = true;
      if (!mounted.current || attempt !== operation.current) throw new Error('녹음 화면을 벗어났어요.');
      await startListening();
      if (!mounted.current || attempt !== operation.current) throw new Error('녹음 화면을 벗어났어요.');
      transition('recording');

      timerRef.current = setInterval(() => {
        if (mounted.current && attempt === operation.current) setElapsed((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      if (audioStarted) await Promise.allSettled([stopListening(), voiceRecording.stopRecording()]);
      if (!mounted.current || attempt !== operation.current) return;
      logger.error('녹음 시작 실패:', error);
      transition('idle');
      Alert.alert('녹음을 시작하지 못했습니다', '잠시 후 다시 시도해주세요.');
    } finally { if (attempt === operation.current) lock.current = false; }
  };

  const stopRecording = async () => {
    if (lock.current || statusRef.current !== 'recording') return;
    lock.current = true;
    const attempt = ++operation.current;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    transition('analyzing');
    let registering = false;
    try {
      const [textResult, audioResult] = await Promise.allSettled([stopListening(), voiceRecording.stopRecording()]);
      if (!mounted.current || attempt !== operation.current) return;
      if (textResult.status === 'rejected' || audioResult.status === 'rejected') throw new Error('녹음을 마무리하지 못했어요. 다시 녹음해주세요.');
      const finalTranscript = textResult.value;
      const recordingResult = audioResult.value;
      if (!finalTranscript.trim() || !recordingResult.uri) throw new Error('인식된 목소리가 없습니다. 다시 녹음해주세요.');
      if (!recordingSentence.current) throw new Error('문장 정보를 불러오지 못했습니다. 다시 시도해주세요.');
      const similarity = readingSimilarity(recordingSentence.current.speechLine, finalTranscript);
      setReadingCheck({ transcript: finalTranscript, similarity });
      if (similarity < MIN_READING_SIMILARITY) {
        transition('idle');
        return;
      }
      registering = true;
      await completeMutation.mutateAsync({
        sentenceId: recordingSentence.current.sentenceId,
        recordingUri: recordingResult.uri,
        durationSeconds: recordingResult.durationSeconds,
      });
      if (mounted.current && attempt === operation.current) {
        setAcceptedAt(Date.now());
        transition('done');
      }
    } catch (error) {
      if (!mounted.current || attempt !== operation.current) return;
      if (getErrorCode(error) === 'VOICE_TRAINING_TOO_FREQUENT') {
        setAcceptedAt(Date.now());
        void twinSyncQuery.refetch();
      }
      transition('idle');
      Alert.alert(registering ? '녹음 제출 실패' : '녹음을 마무리하지 못했어요', getErrorDisplayMessage(error, '다시 녹음해주세요.'));
    } finally { if (attempt === operation.current) lock.current = false; }
  };

  const handleRetry = () => {
    if (lock.current || isInCooldown || twinSyncQuery.isPending || twinSyncQuery.isError) return;
    transition('idle');
    setElapsed(0);
    resetTranscript();
    setReadingCheck(null);
    recordingSentence.current = null;
    completeMutation.reset();
    sentenceQuery.refetch();
  };

  // Native resources are owned by their hooks. Ignore pending work after this screen is removed.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      operation.current += 1;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sentence = (status !== 'idle' || readingCheck) && recordingSentence.current ? recordingSentence.current.speechLine : sentenceQuery.data?.speechLine;
  const sentenceUnavailable = !sentenceQuery.data?.speechLine?.trim() || sentenceQuery.isError || sentenceQuery.isPending || sentenceQuery.isFetching;
  const displayedTranscript = readingCheck?.transcript ?? transcript;
  const actions = <View testID="voice-update-actions" style={[styles.actions, { borderColor: colors.border.primary, backgroundColor: colors.background.card }]}>
    <VoiceUpdateButton status={status} elapsedTime={`${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`}
      onPress={handlePress} onRetry={handleRetry} recordingBlocked={!!sentenceUnavailable}
      cooldownRemainingSeconds={isInCooldown ? remainingSeconds : undefined} isCooldownStatusPending={twinSyncQuery.isPending}
      isCooldownStatusError={twinSyncQuery.isError} isCooldownCheckRetrying={twinSyncQuery.isError && twinSyncQuery.isFetching}
      onRetryCooldownCheck={() => twinSyncQuery.refetch()} />
  </View>;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <View style={styles.container}>
        <View style={contentContainerStyle}><GrowSubScreenHeader title="목소리 정밀 학습" disabled={status === 'starting' || status === 'analyzing'} /></View>

        <ScrollView testID="voice-update-scroll" style={styles.scroll} contentContainerStyle={[styles.main, contentContainerStyle]} showsVerticalScrollIndicator={false}>
          <View style={styles.readingStage}>
          {status === 'idle' && sentenceUnavailable ? <View style={[styles.requestState, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            {sentenceQuery.isError ? <><Text style={[styles.requestTitle, { color: colors.text.primary }]}>읽을 문장을 불러오지 못했어요</Text>
              <Text style={[styles.requestCopy, { color: colors.text.secondary }]}>연결을 확인한 뒤 다시 시도해주세요.</Text>
              <Pressable onPress={() => { void sentenceQuery.refetch(); }} disabled={sentenceQuery.isFetching} accessibilityRole="button" accessibilityLabel="낭독 문장 다시 불러오기" accessibilityState={{ busy: sentenceQuery.isFetching }} style={styles.retry}>
                <Feather name="refresh-cw" size={16} color={colors.text.secondary} /><Text style={[styles.requestCopy, { color: colors.text.primary }]}>{sentenceQuery.isFetching ? '다시 확인 중…' : '다시 불러오기'}</Text>
              </Pressable></> : <><ActivityIndicator color={colors.text.secondary} /><Text style={[styles.requestCopy, { color: colors.text.secondary }]}>읽을 문장을 준비하고 있어요…</Text></>}
          </View> : <VoiceUpdatePrompt sentence={sentence ?? ''} />}

          {/* 녹음 중이거나 인식 결과가 있을 때만 자막을 보여준다. */}
          {(status === 'recording' || !!displayedTranscript) && <VoiceUpdateTranscriptBox
            transcript={displayedTranscript}
            isRecording={status === 'recording'}
            similarity={readingCheck?.similarity}
          />}
          </View>
          {actions}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  scroll: { flex: 1 },
  main: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'stretch',
    gap: 16,
  },
  // Grow into unused viewport space, but keep natural content height when text needs scrolling.
  readingStage: { flexGrow: 1, flexShrink: 0, justifyContent: 'center', gap: 12, paddingVertical: 12 },
  actions: { flexShrink: 0, padding: 16, borderWidth: 1, borderRadius: 24 },
  requestState: { padding: 20, gap: 10, borderWidth: 1, borderRadius: 20 },
  requestTitle: { fontSize: 17, lineHeight: 26, fontWeight: '600' },
  requestCopy: { fontSize: 14, lineHeight: 22 },
  retry: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
});
