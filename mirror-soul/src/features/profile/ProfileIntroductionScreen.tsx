import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { MBTI_AXES } from '@/src/components/home/main/Discovery/mbtiAxes';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { IntroductionVoicePreview } from '@/src/types/api/profile';
import { formatDurationLabel } from '@/src/utils/formatCallTime';
import { useIntroductionQuery } from './hooks/useIntroductionQuery';

/** 공개 모습과 별도로 학습·성장 정보를 보여준다. 기존 profile-introduction 경로는 유지한다. */
export const ProfileIntroductionScreen = () => {
  const router = useRouter();
  const { colors } = useThemeColors();
  const introductionQuery = useIntroductionQuery();
  const twinSyncQuery = useTwinSyncQuery();
  const introduction = introductionQuery.isPreview ? undefined : introductionQuery.data;
  const syncRate = twinSyncQuery.data?.syncRate ?? null;
  const { refetch: refetchIntroduction } = introductionQuery;
  const { refetch: refetchTwin } = twinSyncQuery;
  useFocusEffect(useCallback(() => {
    void refetchIntroduction();
    void refetchTwin();
  }, [refetchIntroduction, refetchTwin]));

  return (
    <ScreenLayout withScroll centerContent={false} paddingBottomOffset={112}>
      <Header title="트윈 상태" onBackPress={() => router.replace('/(main)/profile')} />
      <View style={styles.content}>
        <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>내 목소리와 성향이 트윈에 얼마나 반영됐는지 확인하고 키워 보세요.</Text>
        <Section title="학습 상태" index={0}>
          <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            {twinSyncQuery.isLoading ? (
              <View style={styles.trainingMeta}><ActivityIndicator color={Colors.primary.electricCyan} /><Text style={[styles.trainingText, { color: colors.text.muted }]}>트윈 상태를 불러오는 중이에요.</Text></View>
            ) : twinSyncQuery.isError || !twinSyncQuery.data ? (
              <View style={styles.trainingMeta}>
                <Text style={[styles.trainingText, { color: colors.text.secondary }]}>학습 상태를 불러오지 못했어요.</Text>
                <Pressable onPress={() => refetchTwin()} accessibilityRole="button"><Text style={styles.sectionActionText}>다시 시도</Text></Pressable>
              </View>
            ) : (
              <>
                <View style={styles.readinessHeading}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.text.primary }]}>AI 트윈 싱크로율</Text>
                    <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>{syncRate == null ? '트윈을 준비 중이에요.' : '내 얼굴·목소리·성향의 재현 정도예요.'}</Text>
                  </View>
                  <Text style={styles.syncRate}>{syncRate == null ? '—' : `${syncRate}%`}</Text>
                </View>
                {syncRate != null && <View style={[styles.progressTrack, { backgroundColor: colors.background.glass }]}><LinearGradient colors={Colors.gradient.cyanToPurple} style={[styles.progressFill, { width: `${Math.min(Math.max(syncRate, 0), 100)}%` }]} /></View>}
                <View style={styles.trainingMeta}>
                  <Text style={[styles.trainingText, { color: colors.text.muted }]}>음성 업데이트 {twinSyncQuery.data.voiceTrainingCount}회</Text>
                  <Text style={[styles.trainingText, { color: colors.text.muted }]}>{formatTrainingDate(twinSyncQuery.data.lastVoiceTrainingAt)}</Text>
                </View>
              </>
            )}
            <Pressable onPress={() => router.push('/(main)/grow')} style={[styles.growCta, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]} accessibilityRole="button" accessibilityLabel="성장 탭에서 트윈 키우기">
              <View style={styles.growCtaCopy}><Feather name="trending-up" size={16} color={Colors.primary.electricCyan} /><Text style={[styles.growCtaText, { color: colors.text.primary }]}>성장 탭에서 트윈 키우기</Text></View>
              <Feather name="chevron-right" size={17} color={colors.text.muted} />
            </Pressable>
          </View>
        </Section>
        {introduction ? (
          <>
            <Section
              title="학습된 성향 밸런스"
              index={2}
              rightElement={
                <Pressable
                  onPress={() => router.push({ pathname: '/(main)/customer-center', params: { topic: 'mbti-change' } })}
                  style={styles.sectionAction}
                  accessibilityRole="button"
                  accessibilityLabel="MBTI 변경 문의"
                >
                  <Feather name="camera" size={13} color={Colors.primary.vividPurple} />
                  <Text style={styles.sectionActionText}>MBTI 변경 문의</Text>
                </Pressable>
              }
            >
              <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
                {introduction.mbtiAxisScores ? (
                  MBTI_AXES.map(([field, left, right]) => (
                    <AxisBar key={field} left={left} right={right} value={introduction.mbtiAxisScores?.[field] ?? 0} />
                  ))
                ) : (
                  <EmptyText>성향 밸런스가 준비되면 이곳에서 확인할 수 있어요.</EmptyText>
                )}
                <Text style={[styles.mbtiHelpText, { color: colors.text.muted }]}>검사 결과 이미지를 첨부해 문의하면 확인 절차를 안내해 드려요.</Text>
              </View>
            </Section>

            <Section title="트윈 성향" index={3}>
              <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
                {introduction.personalityTags.length > 0 ? (
                  <View style={styles.tagRow}>
                    {introduction.personalityTags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}># {tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyText>AI 페르소나 분석을 준비하고 있어요.</EmptyText>
                )}
              </View>
            </Section>

            <Section title="트윈 목소리" index={4}>
              <View style={[styles.card, styles.voiceCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
                {introduction.voicePreview ? (
                  <IntroductionVoicePlayer voicePreview={introduction.voicePreview} onUpdate={() => router.push('/voice-update')} />
                ) : (
                  <VoicePreviewEmptyState onUpdate={() => router.push('/voice-update')} />
                )}
              </View>
            </Section>
          </>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            {introductionQuery.isLoading ? <ActivityIndicator color={Colors.primary.electricCyan} /> : <>
              <EmptyText>트윈의 성향과 목소리를 불러오지 못했어요.</EmptyText>
              <Pressable onPress={() => refetchIntroduction()} accessibilityRole="button"><Text style={styles.sectionActionText}>다시 시도</Text></Pressable>
            </>}
          </View>
        )}
      </View>
    </ScreenLayout>
  );
};

function Section({
  title,
  index,
  children,
  rightElement,
}: {
  title: string;
  index: number;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  const { colors } = useThemeColors();
  return (
    <Animated.View entering={FadeInDown.delay(index * 55).duration(360)}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{title}</Text>
        {rightElement}
      </View>
      {children}
    </Animated.View>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  const { colors } = useThemeColors();
  return <Text style={[styles.emptyText, { color: colors.text.muted }]}>{children}</Text>;
}

function AxisBar({ left, right, value }: { left: string; right: string; value: number }) {
  const { colors } = useThemeColors();
  const safeValue = Math.min(Math.max(value, 0), 100);
  return (
    <View style={styles.axisRow} accessibilityRole="progressbar" accessibilityLabel={`${left} 대 ${right}`} accessibilityValue={{ min: 0, max: 100, now: safeValue }}>
      <Text style={[styles.axisLabel, { color: safeValue >= 50 ? Colors.primary.electricCyan : colors.text.muted }]}>{left}</Text>
      <View style={[styles.axisTrack, { backgroundColor: colors.background.glass }]}>
        <LinearGradient colors={Colors.gradient.cyanToPurple} style={[styles.axisFill, { width: `${safeValue}%` }]} />
      </View>
      <Text style={[styles.axisLabel, { color: safeValue < 50 ? Colors.primary.vividPurple : colors.text.muted }]}>{right}</Text>
    </View>
  );
}

function IntroductionVoicePlayer({ voicePreview, onUpdate }: { voicePreview: IntroductionVoicePreview; onUpdate: () => void }) {
  const { colors } = useThemeColors();
  const player = useAudioPlayer(voicePreview.audioUrl);
  const status = useAudioPlayerStatus(player);

  // 재생 중에 "업데이트"나 고객센터로 이동해도(이 화면은 push 대상이라 언마운트되지 않는다)
  // 소리가 계속 나오지 않도록, 화면이 포커스를 잃는 시점에 멈춘다.
  useFocusEffect(
    useCallback(() => () => player.pause(), [player])
  );

  return (
    <View style={styles.voiceContent}>
      <View style={styles.voiceHeading}>
        <View style={[styles.voiceIcon, { backgroundColor: colors.background.glass }]}>
          <Feather name="volume-2" size={20} color={Colors.primary.electricCyan} />
        </View>
        <View style={styles.voiceCopy}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>내 AI 트윈의 목소리</Text>
          <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>
            {formatDurationLabel(voicePreview.durationMs == null ? null : Math.round(voicePreview.durationMs / 1000))} · 실제 트윈 음성을 들어보세요.
          </Text>
        </View>
      </View>
      <View style={styles.voiceActions}>
        <Pressable
          onPress={() => (status.playing ? player.pause() : player.play())}
          style={styles.voicePreviewButton}
          accessibilityRole="button"
          accessibilityLabel={status.playing ? '음성 미리듣기 일시정지' : '음성 미리듣기 재생'}
        >
          <Feather name={status.playing ? 'pause' : 'play'} size={17} color={Colors.primary.soulBlack} />
          <Text style={styles.voicePreviewButtonText}>{status.playing ? '재생 중 · 일시정지' : '음성 미리듣기'}</Text>
        </Pressable>
        <Pressable onPress={onUpdate} style={[styles.voiceUpdateButton, { borderColor: colors.border.primary }]} accessibilityRole="button" accessibilityLabel="목소리 업데이트">
          <Text style={[styles.voiceUpdateText, { color: colors.text.primary }]}>업데이트</Text>
        </Pressable>
      </View>
    </View>
  );
}

function VoicePreviewEmptyState({ onUpdate }: { onUpdate: () => void }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.voiceContent}>
      <View style={styles.voiceHeading}>
        <View style={[styles.voiceIcon, { backgroundColor: colors.background.glass }]}>
          <Feather name="mic" size={20} color={Colors.primary.electricCyan} />
        </View>
        <View style={styles.voiceCopy}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>아직 내 트윈 목소리를 준비 중이에요</Text>
          <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>음성 업데이트를 완료하면 실제 목소리를 미리 들을 수 있어요.</Text>
        </View>
      </View>
      <View style={styles.voiceActions}>
        <View style={[styles.voicePreviewUnavailable, { backgroundColor: colors.background.glass }]} accessibilityLabel="음성 미리듣기 준비 중">
          <Feather name="play" size={16} color={colors.text.muted} />
          <Text style={[styles.voicePreviewUnavailableText, { color: colors.text.muted }]}>음성 미리듣기 준비 중</Text>
        </View>
        <Pressable onPress={onUpdate} style={[styles.voiceUpdateButton, { borderColor: colors.border.primary }]} accessibilityRole="button" accessibilityLabel="음성 업데이트 시작">
          <Text style={[styles.voiceUpdateText, { color: colors.text.primary }]}>업데이트</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatTrainingDate(value: string | null | undefined) {
  if (!value) return '음성 업데이트 기록 없음';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '음성 업데이트 기록 없음';
  return `최근 음성 업데이트 ${date.getMonth() + 1}.${date.getDate()}`;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xxl, gap: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 20, marginBottom: Spacing.sm },
  sectionTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 1.3 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs, paddingHorizontal: Spacing.xs, paddingVertical: Spacing.xxs },
  sectionActionText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary.vividPurple },
  card: { padding: Spacing.lg, borderRadius: Radii.xl, borderWidth: 1, gap: Spacing.md },
  readinessHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg },
  cardTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.bold },
  cardDescription: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 18, marginTop: Spacing.xs },
  syncRate: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: Colors.primary.electricCyan },
  progressTrack: { height: 8, borderRadius: Radii.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radii.full },
  trainingMeta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.md },
  trainingText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs },
  growCta: { minHeight: 42, paddingHorizontal: Spacing.md, borderRadius: Radii.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  growCtaCopy: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  growCtaText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  axisRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  axisLabel: { width: 16, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.black },
  axisTrack: { flex: 1, height: 7, borderRadius: Radii.full, overflow: 'hidden' },
  axisFill: { height: '100%', borderRadius: Radii.full },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.full, backgroundColor: Colors.glass.cyan10_d3, borderColor: Colors.glass.cyan20_d3, borderWidth: 1 },
  tagText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary.electricCyan },
  emptyText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
  mbtiHelpText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, lineHeight: 17, marginTop: Spacing.xs },
  voiceCard: { padding: Spacing.lg },
  voiceContent: { gap: Spacing.md },
  voiceHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  voiceIcon: { width: 48, height: 48, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  voiceCopy: { flex: 1 },
  voiceActions: { flexDirection: 'row', gap: Spacing.sm },
  voicePreviewButton: { flex: 1, minHeight: 42, borderRadius: Radii.md, backgroundColor: Colors.primary.electricCyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  voicePreviewButtonText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary.soulBlack },
  voicePreviewUnavailable: { flex: 1, minHeight: 42, borderRadius: Radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  voicePreviewUnavailableText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  voiceUpdateButton: { minWidth: 78, minHeight: 42, borderRadius: Radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.md },
  voiceUpdateText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
