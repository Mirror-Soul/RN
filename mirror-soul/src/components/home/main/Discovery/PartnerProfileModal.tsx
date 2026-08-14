import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
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
import ReAnimated, {
  Easing as ReEasing,
  FadeInUp,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MbtiAxisScores, SoulMatch } from './DiscoveryMatchCard';

interface PartnerProfileModalProps {
  match: SoulMatch | null;
  onClose: () => void;
  onConnectNow?: (match: SoulMatch) => void;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  // match가 null이 되어도 닫힘 애니메이션이 끝날 때까지 마지막 match를 계속 렌더링하기 위한 상태
  const [displayedMatch, setDisplayedMatch] = useState<SoulMatch | null>(null);

  useEffect(() => {
    if (match) {
      setDisplayedMatch(match);
      setImageFailed(false);
      setIsPlaying(false);
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
          setIsPlaying(false);
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
            {imageFailed ? (
              <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={styles.heroImage}>
                <Text style={styles.heroImageFallbackText}>{displayedMatch.name.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            ) : (
              <Image
                source={{ uri: displayedMatch.profileImage }}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="disk"
                transition={150}
                onError={() => setImageFailed(true)}
              />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(5,5,5,0.4)', isDark ? '#141414' : '#F0EFEB']}
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
                <LinearGradient
                  colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.compatBadge}
                >
                  <Feather name="radio" size={10} color={Colors.neutral.pureWhite} />
                  <Text style={styles.compatBadgeText}>트윈 싱크로율 {displayedMatch.compatibility}%</Text>
                </LinearGradient>
                <View style={styles.mbtiBadge}>
                  <Text style={styles.mbtiBadgeText}>{displayedMatch.mbti}</Text>
                </View>
              </View>
              <Text style={styles.nameText}>
                {displayedMatch.name}
                <Text style={styles.ageText}> {displayedMatch.age}</Text>
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={14} color={Colors.neutral.lightGray} />
                  <Text style={styles.metaText}>{displayedMatch.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Feather name="briefcase" size={14} color={Colors.neutral.lightGray} />
                  <Text style={styles.metaText}>{displayedMatch.job}</Text>
                  {displayedMatch.isJobVerified ? (
                    <Feather name="check-circle" size={14} color={Colors.neutral.pureWhite} />
                  ) : null}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <ReAnimated.View entering={FadeInUp.duration(400)} style={styles.cloneSummaryCard}>
              <Text style={styles.cloneSummaryText}>&quot;{displayedMatch.cloneSummary}&quot;</Text>
              <Text style={styles.cloneSummaryCaption}>AI 트윈이 스스로를 소개하는 한마디</Text>
            </ReAnimated.View>

            <Section title="AI 페르소나 분석" index={1}>
              <Text style={[styles.insightText, { color: colors.text.secondary }]}>
                AI 트윈이 {displayedMatch.name}님의 목소리와 성격을{' '}
                <Text style={styles.insightHighlight}>{displayedMatch.compatibility}%</Text>까지 재현했어요. 대화에서는 이런 성향이 느껴져요.
              </Text>
              <View style={styles.tagRow}>
                {displayedMatch.aiAnalysisTags.map((tag) => (
                  <View key={tag} style={styles.aiTag}>
                    <Text style={styles.aiTagText}># {tag}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section title="성향 밸런스" index={2}>
              <View
                style={[styles.balanceCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
                accessible
                accessibilityLabel={`성향 밸런스: ${MBTI_AXES.map(
                  ([left, right]) =>
                    `${left} ${displayedMatch.mbtiAxisScores[left]}%, ${right} ${100 - displayedMatch.mbtiAxisScores[left]}%`,
                ).join(', ')}`}
              >
                {MBTI_AXES.map(([left, right]) => (
                  <MbtiAxisBar
                    key={left}
                    leftLabel={left}
                    rightLabel={right}
                    value={displayedMatch.mbtiAxisScores[left]}
                    mutedColor={colors.text.muted}
                    trackColor={colors.border.strong}
                  />
                ))}
              </View>
            </Section>

            <Section title="목소리 미리듣기" index={3}>
              <View style={[styles.voiceCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => setIsPlaying((prev) => !prev)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? '일시정지' : '재생'}
                >
                  <Feather name={isPlaying ? 'pause' : 'play'} size={22} color={Colors.primary.soulBlack} />
                </TouchableOpacity>
                <View style={styles.voiceInfo}>
                  <Text style={[styles.voiceStyleText, { color: colors.text.primary }]}>{displayedMatch.voiceStyle}</Text>
                  <VoiceWaveform isPlaying={isPlaying} />
                </View>
              </View>
              <Text style={[styles.voiceHint, { color: colors.text.muted }]}>실제 목소리 미리듣기는 준비 중이에요</Text>
            </Section>

            <Section title="이 사람의 이야기" index={4}>
              <View style={[styles.bioCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
                <Text style={[styles.bioText, { color: colors.text.secondary }]}>&quot;{displayedMatch.bio}&quot;</Text>
              </View>
            </Section>

            <Section title="가치관 성향" index={5}>
              <Text style={[styles.insightText, { color: colors.text.muted }]}>
                성장 가치관 게임 답변을 AI가 분석해서 뽑은 성향이에요.
              </Text>
              <View style={styles.tendencyList}>
                {displayedMatch.valueTendencies.map((tendency) => (
                  <View
                    key={tendency.axisLabel}
                    style={[styles.tendencyItem, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
                  >
                    <View style={styles.tendencyAxisBadge}>
                      <Text style={styles.tendencyAxisText}>{tendency.axisLabel}</Text>
                    </View>
                    <Text style={[styles.tendencyDescription, { color: colors.text.secondary }]}>
                      {tendency.description}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          </View>
        </ScrollView>

        <View style={styles.floatingBar} pointerEvents="box-none">
          <LinearGradient
            colors={['transparent', colors.background.primary, colors.background.primary]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <TouchableOpacity
            onPress={() => onConnectNow?.(displayedMatch)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="통화하기"
            style={styles.connectNowWrapper}
          >
            <LinearGradient
              colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.connectNowButton}
            >
              <Feather name="phone" size={20} color={Colors.neutral.pureWhite} />
              <Text style={styles.connectNowText}>통화하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const MBTI_AXES: [keyof MbtiAxisScores, string][] = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P'],
];

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

const WAVEFORM_BAR_HEIGHTS = [
  10, 18, 12, 26, 16, 32, 14, 24, 10, 30, 20, 36, 12, 22, 16, 28, 10, 24, 14, 20, 12, 26,
];

/**
 * VoiceWaveform 컴포넌트
 * 실제 오디오 연동 전이므로 재생 상태에 따라 움직이는 시각적 피드백만 제공한다.
 * 바마다 개별 withRepeat 애니메이션을 돌리는 대신, 위상(phase)이 계속 순환하는
 * 공유값(progress) 하나만 UI 스레드에서 구동하고 각 바는 그 값에서 사인파로 높이만 파생시킨다 —
 * 22개의 독립적인 애니메이션 루프 대신 1개만 돌려서 UI 스레드 부담을 줄인다.
 */
function VoiceWaveform({ isPlaying }: { isPlaying: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isPlaying) {
      progress.value = withRepeat(withTiming(1, { duration: 1400, easing: ReEasing.linear }), -1, false);
    } else {
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [isPlaying, progress]);

  return (
    <View style={styles.waveform} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {WAVEFORM_BAR_HEIGHTS.map((height, index) => (
        <WaveformBar key={index} baseHeight={height} progress={progress} phase={index / WAVEFORM_BAR_HEIGHTS.length} />
      ))}
    </View>
  );
}

function WaveformBar({
  baseHeight,
  progress,
  phase,
}: {
  baseHeight: number;
  progress: SharedValue<number>;
  phase: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const wave = Math.sin(2 * Math.PI * (progress.value + phase));
    // wave(-1~1)를 0.4~1 스케일로 매핑 — 정지 상태(progress=0)일 때도 자연스러운 최소 높이를 유지한다.
    return { transform: [{ scaleY: 0.7 + wave * 0.3 }] };
  });

  return (
    <ReAnimated.View
      style={[styles.waveformBar, { height: baseHeight, backgroundColor: Colors.primary.electricCyan }, animatedStyle]}
    />
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
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    color: Colors.neutral.lightGray,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: 140,
    gap: Spacing.xxl,
  },
  cloneSummaryCard: {
    padding: Spacing.xl,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    borderColor: Colors.primary.electricCyan,
    backgroundColor: Colors.glass.cyan10_d3,
  },
  cloneSummaryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
    lineHeight: 24,
    color: Colors.primary.electricCyan,
    marginBottom: Spacing.xs,
  },
  cloneSummaryCaption: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.neutral.darkGray,
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
  voiceHint: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    height: 36,
  },
  waveformBar: {
    width: 3,
    borderRadius: Radii.full,
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
  tendencyList: {
    gap: Spacing.sm,
  },
  tendencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.xl,
    borderWidth: 1,
  },
  tendencyAxisBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.md2,
    backgroundColor: Colors.glass.cyan10_d3,
  },
  tendencyAxisText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    fontWeight: FontWeight.black,
    color: Colors.primary.electricCyan,
  },
  tendencyDescription: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
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
