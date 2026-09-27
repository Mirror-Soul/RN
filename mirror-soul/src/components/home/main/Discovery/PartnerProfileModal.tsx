import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useRecommendationDetailQuery } from '@/src/features/home/hooks/useRecommendationDetailQuery';
import { getErrorCode, getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { formatRegion } from '@/src/utils/formatRegion';
import { formatDurationLabel } from '@/src/utils/formatCallTime';
import { jobCategories } from '@/src/components/signup/steps/Step2_BasicProfile/Professional/jobData';
import { MBTI_AXES } from './mbtiAxes';
import { getMockRecommendationDetail, isMockRecommendationUuid } from './mockRecommendations';
import type { Recommendation, VoicePreview } from '@/src/types/api/home';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import ReAnimated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PartnerProfileModalProps {
  match: Recommendation | null;
  onClose: () => void;
  onConnectNow?: (match: Recommendation) => void;
}

/**
 * PartnerProfileModal 컴포넌트 (SRP)
 * 상대 소울의 상세 프로필을 보여주는 전체 화면 바텀시트입니다.
 * SelectDropdownModal.tsx와 동일한 Modal(transparent)+Animated.View 진입 애니메이션 패턴을
 * 세로 슬라이드(하단→전체 화면)로 응용합니다.
 */
export default function PartnerProfileModal({ match, onClose, onConnectNow }: PartnerProfileModalProps) {
  const { colors, isDark } = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // 고정 480px 대신 화면 높이 비율로 — 작은 기기에서 과도하게 크거나 큰 기기에서 작아 보이는 문제 방지
  const heroHeight = Math.min(Math.max(windowHeight * 0.52, 380), 560);
  const progress = useRef(new Animated.Value(0)).current;
  const [imageFailed, setImageFailed] = useState(false);
  // match가 null이 되어도 닫힘 애니메이션이 끝날 때까지 마지막 match를 계속 렌더링하기 위한 상태
  const [displayedMatch, setDisplayedMatch] = useState<Recommendation | null>(null);
  // displayedMatch(닫힘 애니메이션 동안에도 유지되는 값)를 키로 써야, match prop이 먼저 null이
  // 되어도 애니메이션이 끝나기 전에 상세 전용 섹션이 먼저 비어버리지 않는다.
  // 목업 UUID는 백엔드 UUID가 아니며 실제 추천 노출 이력도 없다. 따라서 API 요청을 완전히
  // 건너뛰고, 실제 상세 API 응답과 같은 타입의 fixture로 UI를 렌더링한다.
  const displayedUserUuid = displayedMatch?.userUuid;
  const isMockMatch = isMockRecommendationUuid(displayedUserUuid);
  const mockDetail = getMockRecommendationDetail(displayedUserUuid);
  const {
    data: apiDetail,
    error: detailError,
    isError: isDetailError,
    isFetching: isDetailFetching,
    refetch: refetchDetail,
  } = useRecommendationDetailQuery(isMockMatch ? null : (displayedUserUuid ?? null));
  const detail = mockDetail ?? apiDetail;

  useEffect(() => {
    if (match) {
      setDisplayedMatch(match);
      setImageFailed(false);
      Animated.timing(progress, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (displayedMatch) {
      Animated.timing(progress, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setDisplayedMatch(null);
        }
      });
    }
    // 부모가 이 컴포넌트를 애니메이션 도중 강제로 언마운트하는 경우, 진행 중인 타이밍을
    // 정리하지 않으면 언마운트된 컴포넌트의 상태를 세팅하려는 콜백이 뒤늦게 실행될 수 있다.
    return () => {
      progress.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, progress]);

  if (!displayedMatch) return null;

  // 목록은 모달을 즉시 열기 위한 스냅샷이고, 상세 응답이 도착하면 그것을 정본으로 사용한다.
  // 단, 상세 API가 null을 명시한 필드는 목록의 오래된 값으로 되살리지 않고 빈 상태를 보여준다.
  const profileName = detail?.name ?? displayedMatch.name;
  const profileAge = detail ? detail.age : displayedMatch.age;
  const profileImageUrl = detail ? detail.profileImageUrl : displayedMatch.profileImageUrl;
  const profileRegion = detail ? detail.region : displayedMatch.residence;
  const profileJob = detail ? detail.job : displayedMatch.job;
  const jobCertificationSubmitted = detail ? detail.jobCertificationSubmitted : displayedMatch.jobCertificationSubmitted;
  const profileMbti = detail ? detail.mbti : displayedMatch.mbti;
  const profileIntroduction = detail ? detail.selfIntroduction : displayedMatch.selfIntroduction;
  const personalityTags = detail ? detail.personalityTags : displayedMatch.personalityTags;
  const isRecommendationUnavailable = getErrorCode(detailError) === 'RECOMMENDATION_TARGET_NOT_FOUND';
  const detailErrorMessage = isRecommendationUnavailable
    ? '이 추천은 더 이상 상세 정보를 확인할 수 없어요.'
    : getErrorDisplayMessage(detailError, '상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background.primary },
          {
            transform: [
              {
                translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }),
              },
            ],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={[styles.hero, { height: heroHeight }]}>
            {imageFailed || !profileImageUrl ? (
              <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={styles.heroImage}>
                <Text style={styles.heroImageFallbackText}>{profileName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            ) : (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="disk"
                transition={150}
                onError={() => setImageFailed(true)}
              />
            )}
            {/* heroInfo(이름/위치/직업)는 항상 흰 텍스트라 하단부는 테마와 무관하게 어둡게 유지하고,
                아주 마지막(85~100%) 구간만 콘텐츠 영역과 이어지도록 테마색으로 옮겨 라이트 모드
                대비를 확보한다 — 텍스트 영역까지 밝아지면 라이트 모드에서 흰 글씨가 안 보인다. */}
            <LinearGradient
              colors={['transparent', 'rgba(5,5,5,0.4)', 'rgba(5,5,5,0.75)', isDark ? '#141414' : '#F0EFEB']}
              locations={[0, 0.45, 0.85, 1]}
              style={StyleSheet.absoluteFill}
            />

            <TouchableOpacity
              style={[styles.closeButtonWrapper, { top: insets.top + Spacing.md, right: insets.right + Spacing.xl }]}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <BlurView intensity={40} tint="dark" style={styles.closeButton}>
                <Feather name="x" size={20} color={Colors.neutral.pureWhite} />
              </BlurView>
            </TouchableOpacity>

            <View style={styles.heroInfo}>
              <View style={styles.badgeRow}>
                {detail?.syncRate != null ? (
                  <LinearGradient
                    colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.compatBadge}
                  >
                    <Feather name="radio" size={10} color={Colors.neutral.pureWhite} />
                    <Text style={styles.compatBadgeText}>트윈 싱크로율 {detail.syncRate}%</Text>
                  </LinearGradient>
                ) : null}
                {profileMbti ? (
                  <View style={styles.mbtiBadge}>
                    <Text style={styles.mbtiBadgeText}>{profileMbti}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.nameText}>
                {profileName}
                {profileAge != null ? <Text style={styles.ageText}> {profileAge}</Text> : null}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={14} color={Colors.neutral.lightGray} />
                  <Text style={styles.metaText}>{profileRegion ? formatRegion(profileRegion) : '지역 정보 없음'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="briefcase" size={14} color={Colors.neutral.lightGray} />
                  <Text style={styles.metaText}>
                    {profileJob ? jobCategories.find((c) => c.value === profileJob)?.label ?? profileJob : '직업 정보 없음'}
                  </Text>
                  {jobCertificationSubmitted ? (
                    <View style={styles.documentSubmittedBadge} accessible accessibilityLabel="직업 인증 서류 제출">
                      <Feather name="shield" size={12} color={Colors.neutral.pureWhite} />
                      <Text style={styles.documentSubmittedText}>서류 제출</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            {isDetailError && !isMockMatch ? (
              <DetailLoadError
                message={detailErrorMessage}
                unavailable={isRecommendationUnavailable}
                isRetrying={isDetailFetching}
                onClose={onClose}
                onRetry={() => refetchDetail()}
              />
            ) : (
              <>
                <Section title="AI 페르소나 분석" index={0}>
                  <Text style={[styles.insightText, { color: colors.text.secondary }]}>
                    {detail?.syncRate != null ? (
                      <>
                        AI 트윈이 {profileName}님의 목소리와 성격을{' '}
                        <Text style={styles.insightHighlight}>{detail.syncRate}%</Text>까지 재현했어요. 대화에서는 이런
                        성향이 느껴져요.
                      </>
                    ) : detail ? (
                      'AI 트윈 분석 정보를 아직 준비하고 있어요.'
                    ) : (
                      'AI 트윈 분석 정보를 불러오는 중이에요.'
                    )}
                  </Text>
                  {personalityTags.length > 0 ? (
                    <View style={styles.tagRow}>
                      {personalityTags.map((tag) => (
                        <View key={tag} style={styles.aiTag}>
                          <Text style={styles.aiTagText}># {tag}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.emptyText, { color: colors.text.muted }]}>AI 페르소나 분석을 준비하고 있어요.</Text>
                  )}
                </Section>

                <Section title="MBTI 성향 밸런스" index={1}>
                  <View
                    style={[styles.balanceCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
                    accessible
                    accessibilityLabel={
                      detail?.mbtiAxisScores
                        ? `MBTI 성향 밸런스: ${MBTI_AXES.map(
                            ([field, left, right]) =>
                              `${left} ${detail.mbtiAxisScores?.[field] ?? 0}%, ${right} ${100 - (detail.mbtiAxisScores?.[field] ?? 0)}%`,
                          ).join(', ')}`
                        : detail
                          ? 'MBTI 성향 밸런스 정보 없음'
                          : 'MBTI 성향 밸런스 불러오는 중'
                    }
                  >
                    {detail?.mbtiAxisScores ? (
                      MBTI_AXES.map(([field, left, right]) => (
                        <MbtiAxisBar
                          key={field}
                          leftLabel={left}
                          rightLabel={right}
                          value={detail.mbtiAxisScores?.[field] ?? 0}
                          mutedColor={colors.text.muted}
                          trackColor={colors.border.strong}
                        />
                      ))
                    ) : detail ? (
                      <Text style={[styles.emptyText, { color: colors.text.muted }]}>MBTI 지표가 등록되면 이곳에서 확인할 수 있어요.</Text>
                    ) : (
                      <ActivityIndicator color={colors.text.muted} />
                    )}
                  </View>
                </Section>

                <Section title="목소리 미리듣기" index={2}>
                  <View style={[styles.voiceCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                    {detail?.voicePreview ? (
                      <VoicePreviewPlayer
                        key={detail.voicePreview.audioUrl}
                        voicePreview={detail.voicePreview}
                        isReloading={isDetailFetching}
                        onReload={isMockMatch ? undefined : () => refetchDetail()}
                      />
                    ) : detail ? (
                      <Text style={[styles.voiceStyleText, { color: colors.text.muted }]}>음성 미리듣기를 준비 중이에요.</Text>
                    ) : (
                      <ActivityIndicator color={colors.text.muted} />
                    )}
                  </View>
                </Section>

                <Section title="이 사람의 이야기" index={3}>
                  <View style={[styles.bioCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                    <Text style={[styles.bioText, { color: colors.text.secondary }]}>
                      {profileIntroduction ? `“${profileIntroduction}”` : '등록된 소개가 없어요.'}
                    </Text>
                  </View>
                </Section>
              </>
            )}
          </View>
        </ScrollView>

        <View
          style={[styles.floatingBar, { paddingBottom: Math.max(insets.bottom, Spacing.xxl) }]}
          pointerEvents="box-none"
        >
          <LinearGradient
            colors={['transparent', colors.background.primary, colors.background.primary]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TouchableOpacity
            onPress={() => onConnectNow?.(displayedMatch)}
            disabled={isRecommendationUnavailable}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isRecommendationUnavailable ? '통화할 수 없음' : '통화하기'}
            accessibilityState={{ disabled: isRecommendationUnavailable }}
            style={[styles.connectNowWrapper, isRecommendationUnavailable && styles.connectNowDisabled]}
          >
            <LinearGradient
              colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.connectNowButton}
            >
              <Feather name="phone" size={20} color={Colors.neutral.pureWhite} />
              <Text style={styles.connectNowText}>{isRecommendationUnavailable ? '통화할 수 없어요' : '통화하기'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

/**
 * MbtiAxisBar 컴포넌트
 * value(0~100)는 왼쪽 글자 쪽으로 얼마나 기울었는지를 나타낸다.
 */
function MbtiAxisBar({
  leftLabel,
  rightLabel,
  value,
  mutedColor,
  trackColor,
}: {
  leftLabel: string;
  rightLabel: string;
  value: number;
  mutedColor: string;
  trackColor: string;
}) {
  const leftDominant = value >= 50;
  // 50%에 가까울수록(성향이 애매할수록) 글자 강조를 흐리게, 극단적일수록 진하게 표시한다.
  // 막대 채우기 자체는 항상 또렷한 브랜드 컬러로 — 흐릿해서 안 보이는 문제를 방지한다.
  const intensity = Math.min(Math.abs(value - 50) / 50, 1);
  const letterActiveColor = withAlpha(Colors.primary.electricCyan, 0.6 + intensity * 0.4);

  return (
    <View
      style={styles.axisRow}
      accessibilityRole="progressbar"
      accessibilityLabel={`${leftLabel} 대 ${rightLabel}`}
      accessibilityValue={{ min: 0, max: 100, now: value }}
    >
      <Text style={[styles.axisLetter, { color: leftDominant ? letterActiveColor : mutedColor }]}>{leftLabel}</Text>
      <View style={[styles.axisTrack, { backgroundColor: trackColor }]}>
        <LinearGradient
          colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.axisFill, { width: `${value}%` }]}
        />
      </View>
      <Text style={[styles.axisLetter, { color: !leftDominant ? letterActiveColor : mutedColor }]}>{rightLabel}</Text>
    </View>
  );
}

/** hexColor는 반드시 `#rrggbb` 6자리 hex 형식이어야 한다(rgba 문자열 등은 지원 안 함). */
function withAlpha(hexColor: string, alpha: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * VoicePreviewPlayer 컴포넌트
 * detail이 도착해서 voicePreview가 실제로 있을 때만 마운트된다 — 다른 카드로 전환되면
 * detail 쿼리 키가 바뀌면서 이 컴포넌트가 언마운트되고, expo-audio가 언마운트 시 내부적으로
 * 플레이어를 release하므로 이전 오디오가 자동으로 멈춘다(수동 정리 코드 불필요).
 */
function VoicePreviewPlayer({
  voicePreview,
  onReload,
  isReloading,
}: {
  voicePreview: VoicePreview;
  onReload?: () => void;
  isReloading: boolean;
}) {
  const { colors } = useThemeColors();
  const player = useAudioPlayer(voicePreview.audioUrl);
  const status = useAudioPlayerStatus(player);

  return (
    <>
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => (status.playing ? player.pause() : player.play())}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? '일시정지' : '재생'}
      >
        <Feather name={status.playing ? 'pause' : 'play'} size={22} color={Colors.primary.soulBlack} />
      </TouchableOpacity>
      <View style={styles.voiceInfo}>
        <Text style={[styles.voiceStyleText, { color: colors.text.primary }]}>
          {formatDurationLabel(voicePreview.durationMs == null ? null : Math.round(voicePreview.durationMs / 1000))}
        </Text>
        {onReload ? (
          <TouchableOpacity
            onPress={onReload}
            disabled={isReloading}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="음성 미리듣기 다시 불러오기"
            style={styles.voiceReloadButton}
          >
            {isReloading ? (
              <ActivityIndicator size="small" color={Colors.primary.electricCyan} />
            ) : (
              <>
                <Feather name="refresh-cw" size={12} color={Colors.primary.electricCyan} />
                <Text style={styles.voiceReloadText}>재생이 안 되나요? 다시 불러오기</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );
}

function DetailLoadError({
  message,
  unavailable,
  isRetrying,
  onClose,
  onRetry,
}: {
  message: string;
  unavailable: boolean;
  isRetrying: boolean;
  onClose: () => void;
  onRetry: () => void;
}) {
  const { colors } = useThemeColors();
  const actionLabel = unavailable ? '추천 목록으로 돌아가기' : '다시 시도';

  return (
    <View style={[styles.detailErrorCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <Feather name="alert-circle" size={25} color={colors.text.muted} />
      <Text style={[styles.detailErrorTitle, { color: colors.text.primary }]}>상세 정보를 불러오지 못했어요</Text>
      <Text style={[styles.detailErrorMessage, { color: colors.text.muted }]}>{message}</Text>
      <TouchableOpacity
        onPress={unavailable ? onClose : onRetry}
        disabled={!unavailable && isRetrying}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        style={[styles.detailErrorAction, { borderColor: colors.border.primary }]}
      >
        {!unavailable && isRetrying ? <ActivityIndicator size="small" color={Colors.primary.electricCyan} /> : null}
        <Text style={[styles.detailErrorActionText, { color: colors.text.primary }]}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Section({ title, index, children }: { title: string; index: number; children: React.ReactNode }) {
  const { colors } = useThemeColors();

  return (
    <ReAnimated.View entering={FadeInUp.delay(index * 60).duration(400)}>
      <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>{title}</Text>
      {children}
    </ReAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    width: '100%',
    backgroundColor: Colors.primary.cardBlack,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImageFallbackText: {
    fontFamily: FontFamily.sans,
    fontSize: 96,
    fontWeight: FontWeight.black,
    color: Colors.neutral.pureWhite,
  },
  closeButtonWrapper: {
    position: 'absolute',
    right: Spacing.xl,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroInfo: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    bottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  compatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
  },
  compatBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.neutral.pureWhite,
  },
  mbtiBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white5,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
  },
  mbtiBadgeText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.neutral.lightGray,
  },
  nameText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.giant,
    fontWeight: FontWeight.black,
    letterSpacing: -1.4,
    color: Colors.neutral.pureWhite,
    marginBottom: Spacing.sm,
  },
  ageText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    color: Colors.neutral.darkGray,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.neutral.lightGray,
  },
  documentSubmittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white10,
  },
  documentSubmittedText: {
    fontFamily: FontFamily.sans,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.pureWhite,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: 140,
    gap: Spacing.xxl,
  },
  sectionTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  insightText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  insightHighlight: {
    fontWeight: FontWeight.black,
    color: Colors.primary.electricCyan,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  aiTag: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  aiTagText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary.electricCyan,
  },
  emptyText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  voiceStyleText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  voiceReloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xxs,
  },
  voiceReloadText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary.electricCyan,
  },
  balanceCard: {
    padding: Spacing.xl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    gap: Spacing.lg,
  },
  axisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  axisLetter: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    width: 16,
    textAlign: 'center',
  },
  axisTrack: {
    flex: 1,
    height: 6,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  axisFill: {
    height: '100%',
    borderRadius: Radii.full,
  },
  bioCard: {
    padding: Spacing.xxl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
  },
  bioText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  },
  detailErrorCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.xxl,
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  detailErrorTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  detailErrorMessage: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
    textAlign: 'center',
  },
  detailErrorAction: {
    minHeight: 40,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  detailErrorActionText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.giant,
    paddingBottom: Spacing.xxl,
  },
  connectNowWrapper: {
    flex: 1,
  },
  connectNowDisabled: {
    opacity: 0.45,
  },
  connectNowButton: {
    height: 56,
    borderRadius: Radii.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  connectNowText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    color: Colors.neutral.pureWhite,
  },
});
