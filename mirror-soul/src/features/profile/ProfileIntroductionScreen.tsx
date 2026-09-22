import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { jobCategories } from '@/src/components/signup/steps/Step2_BasicProfile/Professional/jobData';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { IntroductionVoicePreview, MbtiAxisScores } from '@/src/types/api/profile';
import { formatDurationLabel } from '@/src/utils/formatCallTime';
import { formatRegion } from '@/src/utils/formatRegion';
import { useIntroductionQuery } from './hooks/useIntroductionQuery';

const MBTI_AXES: [keyof MbtiAxisScores, string, string][] = [
  ['ieScore', 'I', 'E'],
  ['nsScore', 'N', 'S'],
  ['ftScore', 'F', 'T'],
  ['pjScore', 'P', 'J'],
];

/**
 * 인증한 사용자의 소개를 표시하는 화면이다. 추천 상세와 화면이 같은 필드 계약을 쓰지만,
 * 자기 자신을 추천 상세 API로 조회하지 않고 `/my-page/introduction`만 호출한다.
 */
export const ProfileIntroductionScreen = () => {
  const router = useRouter();
  const { colors } = useThemeColors();
  const introductionQuery = useIntroductionQuery();
  const twinSyncQuery = useTwinSyncQuery();
  const [imageFailed, setImageFailed] = useState(false);
  const introduction = introductionQuery.data;
  const syncRate = introduction?.syncRate ?? twinSyncQuery.data?.syncRate ?? null;

  const accountButton = (
    <Pressable
      onPress={() => router.push('/(main)/account')}
      style={[styles.accountButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      accessibilityRole="button"
      accessibilityLabel="계정 관리"
    >
      <Feather name="settings" size={18} color={colors.text.primary} />
    </Pressable>
  );

  return (
    <ScreenLayout withScroll centerContent={false} paddingBottomOffset={112}>
      <Header title="내 소개" onBackPress={() => router.replace('/(main)/profile')} rightElement={accountButton} />

      {introductionQuery.isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary.electricCyan} />
          <Text style={[styles.stateText, { color: colors.text.muted }]}>내 소개를 불러오는 중이에요.</Text>
        </View>
      ) : introductionQuery.isError || !introduction ? (
        <View style={[styles.errorCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          <Feather name="alert-circle" size={22} color={colors.text.muted} />
          <Text style={[styles.errorTitle, { color: colors.text.primary }]}>내 소개를 불러올 수 없어요</Text>
          <Text style={[styles.errorDescription, { color: colors.text.secondary }]}>잠시 후 다시 시도해 주세요.</Text>
          <Pressable
            onPress={() => introductionQuery.refetch()}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="내 소개 다시 불러오기"
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(380)}>
            <LinearGradient colors={Colors.gradient.cyanToPurple} style={styles.heroBorder}>
              <View style={[styles.heroCard, { backgroundColor: colors.background.card }]}>
                <View style={styles.heroTopRow}>
                  <View style={styles.avatarWrapper}>
                    {introduction.profileImageUrl && !imageFailed ? (
                      <Image
                        source={{ uri: introduction.profileImageUrl }}
                        style={styles.avatar}
                        contentFit="cover"
                        onError={() => setImageFailed(true)}
                      />
                    ) : (
                      <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={styles.avatar}>
                        <Text style={styles.avatarFallback}>{introduction.name?.trim().charAt(0) || '나'}</Text>
                      </LinearGradient>
                    )}
                    <View style={styles.twinDot} />
                  </View>
                  <View style={styles.heroCopy}>
                    <Text style={[styles.eyebrow, { color: colors.text.muted }]}>MY AI TWIN</Text>
                    {introductionQuery.isPreview ? (
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewBadgeText}>개발용 목 데이터</Text>
                      </View>
                    ) : null}
                    <Text style={[styles.name, { color: colors.text.primary }]}>
                      {introduction.name?.trim() || '내 프로필'}
                      {introduction.age != null ? ` · ${introduction.age}` : ''}
                    </Text>
                    <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                      {[introduction.mbti, introduction.region ? formatRegion(introduction.region) : null].filter(Boolean).join('  ·  ') || '프로필을 완성해 보세요'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.jobRow, { borderTopColor: colors.border.primary }]}>
                  <Feather name="briefcase" size={15} color={colors.text.muted} />
                  <Text style={[styles.jobText, { color: colors.text.secondary }]}>
                    {introduction.job ? jobCategories.find((job) => job.value === introduction.job)?.label ?? introduction.job : '직업 미입력'}
                  </Text>
                  {introduction.jobCertificationSubmitted ? <Feather name="check-circle" size={15} color={Colors.primary.successGreen} /> : null}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Section title="TWIN READINESS" index={1}>
            <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <View style={styles.readinessHeading}>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text.primary }]}>AI 트윈 싱크로율</Text>
                  <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>내 목소리와 성향을 반영한 현재 상태예요.</Text>
                </View>
                <Text style={styles.syncRate}>{syncRate == null ? '—' : `${syncRate}%`}</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.background.glass }]}>
                <LinearGradient
                  colors={Colors.gradient.cyanToPurple}
                  style={[styles.progressFill, { width: `${Math.min(Math.max(syncRate ?? 0, 0), 100)}%` }]}
                />
              </View>
              <View style={styles.trainingMeta}>
                <Text style={[styles.trainingText, { color: colors.text.muted }]}>음성 업데이트 {twinSyncQuery.data?.voiceTrainingCount ?? 0}회</Text>
                <Text style={[styles.trainingText, { color: colors.text.muted }]}>{formatTrainingDate(twinSyncQuery.data?.lastVoiceTrainingAt)}</Text>
              </View>
            </View>
          </Section>

          <Section title="성향 밸런스" index={2}>
            <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              {introduction.mbtiAxisScores ? (
                MBTI_AXES.map(([field, left, right]) => (
                  <AxisBar key={field} left={left} right={right} value={introduction.mbtiAxisScores?.[field] ?? 0} />
                ))
              ) : (
                <EmptyText>성향 밸런스가 준비되면 이곳에서 확인할 수 있어요.</EmptyText>
              )}
            </View>
          </Section>

          <Section title="AI 페르소나" index={3}>
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

          <Section title="목소리 미리듣기" index={4}>
            <View style={[styles.card, styles.voiceCard, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              {introduction.voicePreview ? (
                <IntroductionVoicePlayer voicePreview={introduction.voicePreview} />
              ) : (
                <>
                  <View style={[styles.voiceIcon, { backgroundColor: colors.background.glass }]}>
                    <Feather name="mic" size={20} color={Colors.primary.electricCyan} />
                  </View>
                  <View style={styles.voiceCopy}>
                    <Text style={[styles.cardTitle, { color: colors.text.primary }]}>음성 미리듣기를 준비 중이에요</Text>
                    <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>음성 업데이트를 완료하면 내 트윈의 목소리를 확인할 수 있어요.</Text>
                  </View>
                  <Pressable onPress={() => router.push('/voice-update')} accessibilityRole="button" accessibilityLabel="음성 업데이트 시작">
                    <Text style={styles.linkText}>업데이트</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Section>

          <Section title="나의 이야기" index={5}>
            <View style={[styles.card, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              {introduction.selfIntroduction?.trim() ? (
                <Text style={[styles.introductionText, { color: colors.text.secondary }]}>{introduction.selfIntroduction.trim()}</Text>
              ) : (
                <EmptyText>아직 작성한 소개가 없어요.</EmptyText>
              )}
            </View>
          </Section>
        </View>
      )}
    </ScreenLayout>
  );
};

function Section({ title, index, children }: { title: string; index: number; children: React.ReactNode }) {
  const { colors } = useThemeColors();
  return (
    <Animated.View entering={FadeInDown.delay(index * 55).duration(360)}>
      <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{title}</Text>
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

function IntroductionVoicePlayer({ voicePreview }: { voicePreview: IntroductionVoicePreview }) {
  const { colors } = useThemeColors();
  const player = useAudioPlayer(voicePreview.audioUrl);
  const status = useAudioPlayerStatus(player);
  return (
    <>
      <Pressable onPress={() => (status.playing ? player.pause() : player.play())} style={styles.playButton} accessibilityRole="button" accessibilityLabel={status.playing ? '목소리 미리듣기 일시정지' : '목소리 미리듣기 재생'}>
        <Feather name={status.playing ? 'pause' : 'play'} size={22} color={Colors.primary.soulBlack} />
      </Pressable>
      <View style={styles.voiceCopy}>
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>내 AI 트윈의 목소리</Text>
        <Text style={[styles.cardDescription, { color: colors.text.secondary }]}>{formatDurationLabel(voicePreview.durationMs == null ? null : Math.round(voicePreview.durationMs / 1000))}</Text>
      </View>
    </>
  );
}

function formatTrainingDate(value: string | null | undefined) {
  if (!value) return '최근 업데이트 없음';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '최근 업데이트 없음';
  return `최근 업데이트 ${date.getMonth() + 1}.${date.getDate()}`;
}

const styles = StyleSheet.create({
  accountButton: { width: 40, height: 40, borderRadius: Radii.lg2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  centerState: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  stateText: { fontFamily: FontFamily.sans, fontSize: FontSize.base },
  errorCard: { margin: Spacing.xxl, padding: Spacing.xxxl, borderRadius: Radii.xl, borderWidth: 1, alignItems: 'center', gap: Spacing.sm },
  errorTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: Spacing.sm },
  errorDescription: { fontFamily: FontFamily.sans, fontSize: FontSize.base, textAlign: 'center' },
  retryButton: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.full, backgroundColor: Colors.primary.electricCyan },
  retryButtonText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary.soulBlack },
  content: { paddingHorizontal: Spacing.xxl, gap: Spacing.xxl },
  heroBorder: { padding: 1, borderRadius: Radii.xxl },
  heroCard: { padding: Spacing.xl, borderRadius: Radii.xxl - 1 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 76, height: 76, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  avatarFallback: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: Colors.neutral.pureWhite },
  twinDot: { position: 'absolute', right: 1, bottom: 2, width: 15, height: 15, borderRadius: Radii.full, backgroundColor: Colors.primary.successGreen, borderColor: Colors.neutral.pureWhite, borderWidth: 2 },
  heroCopy: { flex: 1, gap: Spacing.xs },
  eyebrow: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 1.25 },
  previewBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs, borderRadius: Radii.full, backgroundColor: Colors.glass.purple20 },
  previewBadgeText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary.vividPurple },
  name: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.black, letterSpacing: -0.8 },
  metaText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
  jobRow: { marginTop: Spacing.xl, paddingTop: Spacing.md, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  jobText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, flex: 1 },
  sectionTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 1.3, marginBottom: Spacing.md },
  card: { padding: Spacing.xl, borderRadius: Radii.xl, borderWidth: 1, gap: Spacing.lg },
  readinessHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg },
  cardTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.bold },
  cardDescription: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 18, marginTop: Spacing.xs },
  syncRate: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: Colors.primary.electricCyan },
  progressTrack: { height: 8, borderRadius: Radii.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radii.full },
  trainingMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  trainingText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs },
  axisRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  axisLabel: { width: 16, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.black },
  axisTrack: { flex: 1, height: 7, borderRadius: Radii.full, overflow: 'hidden' },
  axisFill: { height: '100%', borderRadius: Radii.full },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radii.full, backgroundColor: Colors.glass.cyan10_d3, borderColor: Colors.glass.cyan20_d3, borderWidth: 1 },
  tagText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary.electricCyan },
  emptyText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 20 },
  voiceCard: { flexDirection: 'row', alignItems: 'center' },
  voiceIcon: { width: 48, height: 48, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  playButton: { width: 48, height: 48, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary.electricCyan },
  voiceCopy: { flex: 1 },
  linkText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary.electricCyan },
  introductionText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 26 },
});
