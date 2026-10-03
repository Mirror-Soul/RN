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
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { logger } from '@/src/utils/logger';

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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lock = useRef(false);
  const mounted = useRef(true);
  const operation = useRef(0);
  const statusRef = useRef<VoiceUpdateStatus>('idle');
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
  const { isInCooldown, remainingSeconds } = useVoiceTrainingCooldown(twinSyncQuery.data?.lastVoiceTrainingAt);

  // STT 훅 연동 (실시간 자막 표시용 — 업로드용 오디오 파일은 useVoiceRecording이 별도로 녹음)
  const { transcript, startListening, stopListening, resetTranscript } = useSTT('ko-KR');

  // 낭독 문장 조회 실패 시 안내 + 재시도 (필수 데이터 없인 진행 불가 화면 패턴)
  useEffect(() => {
    if (sentenceQuery.isError) {
      Alert.alert('알림', '낭독 문장을 불러오지 못했습니다.', [
        { text: '재시도', onPress: () => sentenceQuery.refetch() },
      ]);
    }
    // sentenceQuery 객체 전체를 deps에 넣으면 매 렌더마다 새 참조라 effect가 계속 재실행된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentenceQuery.isError]);

  const handlePress = () => {
    if (statusRef.current === 'idle') void startRecording();
    else if (statusRef.current === 'recording') void stopRecording();
  };

  const startRecording = async () => {
    if (lock.current || statusRef.current !== 'idle' || !sentenceQuery.data || isInCooldown || twinSyncQuery.isPending || twinSyncQuery.isError) return;
    lock.current = true;
    const attempt = ++operation.current;
    let audioStarted = false;
    transition('starting');
    try {
      setElapsed(0);

      if (!voiceRecording.hasPermission) {
        const granted = await voiceRecording.requestPermission();
        if (!mounted.current || attempt !== operation.current) return;
        if (!granted) {
          transition('idle');
          Alert.alert('마이크 권한 필요', '설정에서 마이크 권한을 허용해주세요.');
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
        setElapsed((prev) => prev + 0.1);
      }, 100);
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
      if (!sentenceQuery.data) throw new Error('문장 정보를 불러오지 못했습니다. 다시 시도해주세요.');
      registering = true;
      await completeMutation.mutateAsync({
        sentenceId: sentenceQuery.data.sentenceId,
        recordingUri: recordingResult.uri,
        durationSeconds: recordingResult.durationSeconds,
      });
      if (mounted.current && attempt === operation.current) transition('done');
    } catch (error) {
      if (!mounted.current || attempt !== operation.current) return;
      transition('idle');
      Alert.alert(registering ? '학습 저장 실패' : '녹음을 마무리하지 못했어요', getErrorDisplayMessage(error, '다시 녹음해주세요.'));
    } finally { if (attempt === operation.current) lock.current = false; }
  };

  const handleRetry = () => {
    if (lock.current) return;
    transition('idle');
    setElapsed(0);
    resetTranscript();
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <View style={styles.container}>
        <GrowSubScreenHeader title="목소리 업데이트" />

        <View style={[styles.main, contentContainerStyle]}>
          <VoiceUpdatePrompt sentence={sentenceQuery.data?.speechLine ?? '문장을 불러오는 중...'} />

          {/* 실시간 STT 결과창: 빈 공간을 채우고 사용자에게 피드백 제공 */}
          <VoiceUpdateTranscriptBox
            transcript={transcript}
            isRecording={status === 'recording'}
          />

          <VoiceUpdateButton
            status={status}
            elapsedTime={elapsed.toFixed(1)}
            onPress={handlePress}
            onRetry={handleRetry}
            cooldownRemainingSeconds={isInCooldown ? remainingSeconds : undefined}
            isCooldownStatusPending={twinSyncQuery.isPending}
            isCooldownStatusError={twinSyncQuery.isError}
            isCooldownCheckRetrying={twinSyncQuery.isError && twinSyncQuery.isFetching}
            onRetryCooldownCheck={() => twinSyncQuery.refetch()}
          />
        </View>
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
  main: {
    flex: 1,
    paddingVertical: Spacing.giant,
    justifyContent: 'center', // 중앙 집중형 배치
    alignItems: 'center',
    gap: Spacing.massive, // 컴포넌트 간 충분한 간격 확보
  },
});
