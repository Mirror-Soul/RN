import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';
import { MBTI_AXES } from '@/src/components/home/main/Discovery/mbtiAxes';
import { jobCategories } from '@/src/components/signup/steps/Step2_BasicProfile/Professional/jobData';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { IntroductionVoicePreview } from '@/src/types/api/profile';
import { formatDurationLabel } from '@/src/utils/formatCallTime';
import { formatRegion } from '@/src/utils/formatRegion';
import { useIntroductionQuery } from './hooks/useIntroductionQuery';

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

  // 이 화면은 (main) 탭 네비게이터 안의 Screen이라 다른 화면으로 push해도 언마운트되지
  // 않는다 — staleTime: 0만으로는 재진입 시 refetch가 안 되므로(react-query는 탭 재포커스를
  // 트리거로 보지 않는다) 포커스를 얻을 때마다 명시적으로 refetch한다. voicePreview.audioUrl은
  // presigned URL이라 오래 머물면 만료될 수 있다.
  const { refetch: refetchIntroduction } = introductionQuery;
  useFocusEffect(
    useCallback(() => {
      refetchIntroduction();
    }, [refetchIntroduction])
  );

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
                  <View style={styles.jobCopy}>
                    <Text style={[styles.jobText, { color: colors.text.secondary }]}>
                      {introduction.job ? jobCategories.find((job) => job.value === introduction.job)?.label ?? introduction.job : '직업 미입력'}
                    </Text>
                    <Text style={[styles.jobStatusText, { color: colors.text.muted }]}>
                      {introduction.jobCertificationSubmitted ? '직업 인증 서류 제출 완료' : '직업 인증으로 신뢰 프로필을 완성해 보세요'}
                    </Text>
                  </View>
                  {introduction.jobCertificationSubmitted ? (
                    <View style={styles.jobVerifiedBadge} accessibilityLabel="직업 인증 서류 제출 완료">
                      <Feather name="shield" size={13} color={Colors.primary.successGreen} />
                      <Text style={styles.jobVerifiedText}>인증 서류 제출</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => router.push({ pathname: '/(main)/customer-center', params: { topic: 'job-verification' } })}
                      style={[styles.jobVerifyButton, { borderColor: colors.border.primary, backgroundColor: colors.background.glass }]}
                      accessibilityRole="button"
                      accessibilityLabel="직업 인증 방법 보기"
                    >
                      <Feather name="upload-cloud" size={14} color={Colors.primary.electricCyan} />
                      <Text style={styles.jobVerifyText}>인증하기</Text>
                    </Pressable>
                  )}
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
              <Pressable
                onPress={() => router.push('/(main)/grow')}
                style={[styles.growCta, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
                accessibilityRole="button"
                accessibilityLabel="성장 탭에서 트윈 키우기"
              >
                <View style={styles.growCtaCopy}>
                  <Feather name="trending-up" size={16} color={Colors.primary.electricCyan} />
                  <Text style={[styles.growCtaText, { color: colors.text.primary }]}>성장 탭에서 트윈 키우기</Text>
                </View>
                <Feather name="chevron-right" size={17} color={colors.text.muted} />
              </Pressable>
            </View>
          </Section>

          <Section
            title="성향 밸런스"
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
                <IntroductionVoicePlayer voicePreview={introduction.voicePreview} onUpdate={() => router.push('/voice-update')} />
              ) : (
                <VoicePreviewEmptyState onUpdate={() => router.push('/voice-update')} />
              )}
            </View>
          </Section>

          <Section
            title="나의 이야기"
            index={5}
            rightElement={
              <Pressable
                onPress={() => router.push({ pathname: '/(main)/customer-center', params: { topic: 'introduction-edit' } })}
                style={styles.sectionAction}
                accessibilityRole="button"
                accessibilityLabel="자기소개 수정 요청"
              >
                <Feather name="edit-2" size={13} color={Colors.primary.electricCyan} />
                <Text style={[styles.sectionActionText, styles.storyEditText]}>수정 요청</Text>
              </Pressable>
            }
          >
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
  accountButton: { width: 40, height: 40, borderRadius: Radii.lg2, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  centerState: { minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  stateText: { fontFamily: FontFamily.sans, fontSize: FontSize.base },
  errorCard: { margin: Spacing.xxl, padding: Spacing.xxxl, borderRadius: Radii.xl, borderWidth: 1, alignItems: 'center', gap: Spacing.sm },
  errorTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: Spacing.sm },
  errorDescription: { fontFamily: FontFamily.sans, fontSize: FontSize.base, textAlign: 'center' },
  retryButton: { marginTop: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.full, backgroundColor: Colors.primary.electricCyan },
  retryButtonText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary.soulBlack },
  content: { paddingHorizontal: Spacing.xxl, gap: Spacing.xl },
  heroBorder: { padding: 1, borderRadius: Radii.xxl },
  heroCard: { padding: Spacing.lg, borderRadius: Radii.xxl - 1 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 76, height: 76, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  avatarFallback: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: Colors.neutral.pureWhite },
  heroCopy: { flex: 1, gap: Spacing.xs },
  eyebrow: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 1.25 },
  previewBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xxs, borderRadius: Radii.full, backgroundColor: Colors.glass.purple20 },
  previewBadgeText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary.vividPurple },
  name: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.black, letterSpacing: -0.8 },
  metaText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
  jobRow: { marginTop: Spacing.lg, paddingTop: Spacing.sm, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  jobCopy: { flex: 1, gap: Spacing.xxs },
  jobText: { fontFamily: FontFamily.sans, fontSize: FontSize.sm },
  jobStatusText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, lineHeight: 14 },
  jobVerifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radii.full, backgroundColor: Colors.glass.green10, borderWidth: 1, borderColor: Colors.glass.green20 },
  jobVerifiedText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary.successGreen },
  jobVerifyButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radii.full, borderWidth: 1 },
  jobVerifyText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary.electricCyan },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 20, marginBottom: Spacing.sm },
  sectionTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 1.3 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xxs, paddingHorizontal: Spacing.xs, paddingVertical: Spacing.xxs },
  sectionActionText: { fontFamily: FontFamily.sans, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary.vividPurple },
  storyEditText: { color: Colors.primary.electricCyan },
  card: { padding: Spacing.lg, borderRadius: Radii.xl, borderWidth: 1, gap: Spacing.md },
  readinessHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg },
  cardTitle: { fontFamily: FontFamily.sans, fontSize: FontSize.base, fontWeight: FontWeight.bold },
  cardDescription: { fontFamily: FontFamily.sans, fontSize: FontSize.sm, lineHeight: 18, marginTop: Spacing.xs },
  syncRate: { fontFamily: FontFamily.sans, fontSize: FontSize.xxxl, fontWeight: FontWeight.black, color: Colors.primary.electricCyan },
  progressTrack: { height: 8, borderRadius: Radii.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radii.full },
  trainingMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
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
  introductionText: { fontFamily: FontFamily.sans, fontSize: FontSize.lg, fontWeight: FontWeight.medium, lineHeight: 26 },
});
