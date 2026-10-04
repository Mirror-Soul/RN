import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { MBTI_AXES } from '@/src/components/home/main/Discovery/mbtiAxes';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { IntroductionVoicePreview } from '@/src/types/api/profile';
import { VoicePreviewPlayer } from './components/VoicePreviewPlayer';
import { useProfileRefresh } from './hooks/useProfileRefresh';
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
  const refresh = useCallback(() => Promise.allSettled([refetchIntroduction(), refetchTwin()]), [refetchIntroduction, refetchTwin]);
  useProfileRefresh(refresh, !!introduction && !introduction.voicePreview);

  return (
    <ScreenLayout withScroll centerContent={false} paddingBottomOffset={112}>
      <Header title="트윈 상태" onBackPress={() => router.replace('/(main)/profile')} />
      <View style={styles.content}>
        <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>내 목소리와 성향이 트윈에 얼마나 반영됐는지 확인하고 키워 보세요.</Text>
        <Pressable onPress={() => { void refresh(); }} disabled={introductionQuery.isFetching || twinSyncQuery.isFetching} accessibilityRole="button" accessibilityLabel="트윈 정보 새로고침" style={{ minHeight: 44, justifyContent: 'center' }}><Text style={styles.sectionActionText}>{introductionQuery.isFetching || twinSyncQuery.isFetching ? '최신 정보를 확인하고 있어요…' : '최신 정보 확인'}</Text></Pressable>
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
                    <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>{syncRate == null ? '아직 싱크로율 정보가 없어요.' : '내 얼굴·목소리·성향의 재현 정도예요.'}</Text>
                  </View>
                  <Text style={styles.syncRate}>{syncRate == null ? '—' : `${syncRate}%`}</Text>
                </View>
                {syncRate != null && <View style={[styles.progressTrack, { backgroundColor: colors.background.glass }]}><LinearGradient colors={Colors.gradient.cyanToPurple} style={[styles.progressFill, { width: `${Math.min(Math.max(syncRate, 0), 100)}%` }]} /></View>}
                <View style={styles.trainingMeta}>
                  <Text style={[styles.trainingText, { color: colors.text.muted }]}>음성 업데이트 제출 {twinSyncQuery.data.voiceTrainingCount}회</Text>
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
              title="가입 시 선택한 성향"
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
                <Text style={[styles.mbtiHelpText, { color: colors.text.muted }]}>가입할 때 선택한 MBTI를 보여드려요. 인터뷰로 분석된 성향과는 별개예요.</Text>
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
                  <EmptyText>아직 표시할 트윈 성향이 없어요.</EmptyText>
                )}
              </View>
            </Section>

            <Section title="트윈 목소리" index={4}>
              <View style={[styles.card, styles.voiceCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
                {introduction.voicePreview ? (
                  <IntroductionVoicePlayer voicePreview={introduction.voicePreview} onReload={() => refetchIntroduction({ throwOnError: true })} isReloading={introductionQuery.isFetching} onUpdate={() => router.push('/voice-update')} />
                ) : (
                  <VoicePreviewEmptyState onReload={() => { void refetchIntroduction(); }} isReloading={introductionQuery.isFetching} onUpdate={() => router.push('/voice-update')} />
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

function IntroductionVoicePlayer({ voicePreview, onUpdate, onReload, isReloading }: { voicePreview: IntroductionVoicePreview; onUpdate: () => void; onReload: () => Promise<unknown>; isReloading: boolean }) {
  const { colors } = useThemeColors();
  return <View style={styles.voiceContent}>
    <Text style={[styles.cardTitle, { color: colors.text.primary }]}>내 AI 트윈의 목소리</Text>
    <VoicePreviewPlayer voicePreview={voicePreview} onReload={onReload} isReloading={isReloading} />
    <Pressable onPress={onUpdate} style={[styles.voiceUpdateButton, { borderColor: colors.border.primary }]} accessibilityRole="button" accessibilityLabel="목소리 업데이트"><Text style={[styles.voiceUpdateText, { color: colors.text.primary }]}>목소리 업데이트</Text></Pressable>
  </View>;
}

function VoicePreviewEmptyState({ onUpdate, onReload, isReloading }: { onUpdate: () => void; onReload: () => void; isReloading: boolean }) {
  const { colors } = useThemeColors();
  return (
    <View style={styles.voiceContent}>
      <View style={styles.voiceHeading}>
        <View style={[styles.voiceIcon, { backgroundColor: colors.background.glass }]}>
          <Feather name="mic" size={20} color={Colors.primary.electricCyan} />
        </View>
        <View style={styles.voiceCopy}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>아직 미리 들을 수 있는 음성이 없어요</Text>
          <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>학습 완료와 미리듣기 제공 시점은 다를 수 있어요. 잠시 후 다시 확인해 주세요.</Text>
        </View>
      </View>
      <View style={styles.voiceActions}>
        <Pressable onPress={onReload} disabled={isReloading} accessibilityRole="button" accessibilityLabel="음성 미리듣기 다시 확인" style={[styles.voiceUpdateButton, { borderColor: colors.border.primary }]}><Text style={[styles.voiceUpdateText, { color: colors.brand.accent }]}>다시 확인</Text></Pressable>
        <Pressable onPress={onUpdate} style={[styles.voiceUpdateButton, { borderColor: colors.border.primary }]} accessibilityRole="button" accessibilityLabel="음성 업데이트 시작">
          <Text style={[styles.voiceUpdateText, { color: colors.text.primary }]}>업데이트</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatTrainingDate(value: string | null | undefined) {
  if (!value) return '음성 제출 기록 없음';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '음성 제출 기록 없음';
  return `최근 제출 ${date.getMonth() + 1}.${date.getDate()}`;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.xxl, gap: Spacing.xl },
  sectionHeader: { flexWrap: 'wrap', gap: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 20, marginBottom: Spacing.sm },
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
  voiceActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  voiceUpdateButton: { minWidth: 78, minHeight: 42, borderRadius: Radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.md },
  voiceUpdateText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
