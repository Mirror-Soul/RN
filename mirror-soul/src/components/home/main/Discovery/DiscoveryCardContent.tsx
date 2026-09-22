import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatRegion } from '@/src/utils/formatRegion';
import { JOB_LABEL } from '@/src/constants/jobLabels';
import type { Recommendation } from '@/src/types/api/home';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DiscoveryCardContentProps {
  match: Recommendation;
  /** 사진 위 chevron(상세보기)/매칭점수 배지 노출 여부. 기본 false — DiscoveryStackPeek
      용도의 기본값이고, DiscoveryMatchCard(실카드)가 명시적으로 true를 넘긴다. */
  showPhotoOverlays?: boolean;
  /** true(실카드 기본)면 한줄소개가 2줄↔무제한 토글을 지원. false(peek 기본)면 항상
      1줄로 고정하고 "더보기" 토글 자체를 렌더링하지 않는다(측정 오버헤드도 없음). */
  summaryExpandable?: boolean;
  /** 안 넘기면(예: DiscoveryStackPeek) 그냥 반응 없는 View로 남는다. */
  onPhotoPress?: () => void;
  onContentPress?: () => void;
  onConnectPress?: () => void;
}

/**
 * DiscoveryCardContent 컴포넌트 (SRP)
 * 발견 탭 추천 카드의 "정보 표시" 부분(사진/이름/메타/한줄소개/칩/통화하기 버튼
 * 모양)만 담당하는 순수 프레젠테이션 컴포넌트 — 제스처/애니메이션/전체화면 모달은
 * 전혀 모른다. DiscoveryMatchCard(실카드, 제스처+변환+라이트박스를 감싸서 씀)와
 * DiscoveryStackPeek(장식용 배경, 진행도 기반 변환만 감싸서 씀)이 이 컴포넌트
 * 하나를 공유한다 — 두 파일이 카드 내용을 따로 복제해서 생기던 드리프트(예: 나이
 * 표시가 한쪽만 업데이트되던 문제)를 근본적으로 막기 위해 분리했다.
 */
export default function DiscoveryCardContent({
  match,
  showPhotoOverlays = false,
  summaryExpandable = false,
  onPhotoPress,
  onContentPress,
  onConnectPress,
}: DiscoveryCardContentProps) {
  const { colors } = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);
  const [isSummaryTruncated, setIsSummaryTruncated] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const isScoreKnown = Number.isFinite(match.recommendationScore);

  return (
    <>
      {/* 상단: 고정 비율 사진 박스 (풀블리드 아님) */}
      <TouchableOpacity
        style={styles.photoBox}
        onPress={onPhotoPress}
        activeOpacity={0.95}
        disabled={imageFailed || !onPhotoPress}
        accessibilityRole="button"
        accessibilityLabel="사진 크게 보기"
      >
        {imageFailed ? (
          <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={styles.photo}>
            <Text style={styles.photoFallbackText}>{match.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        ) : (
          <Image
            source={{ uri: match.profileImageUrl }}
            style={styles.photo}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
            onError={() => setImageFailed(true)}
          />
        )}

        {showPhotoOverlays && (
          <>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={onContentPress}
              disabled={!onContentPress}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="상세 프로필 보기"
            >
              <Feather name="chevron-right" size={20} color={Colors.neutral.pureWhite} />
            </TouchableOpacity>

            {isScoreKnown && (
              <View style={styles.scoreBadge}>
                <Feather name="zap" size={11} color={Colors.primary.soulBlack} />
                <Text style={styles.scoreBadgeText}>매칭적합도 {match.recommendationScore}%</Text>
              </View>
            )}
          </>
        )}
      </TouchableOpacity>

      {/* 하단: 글래스 카드 정보 섹션 */}
      <TouchableOpacity
        style={styles.content}
        onPress={onContentPress}
        disabled={!onContentPress}
        activeOpacity={0.95}
        accessibilityRole="button"
        accessibilityLabel="상세 프로필 보기"
      >
        <View style={styles.nameRow}>
          <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>
            {match.name}
          </Text>
          {match.age !== null && (
            <View style={[styles.chip, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <Text style={[styles.chipText, { color: colors.text.secondary }]}>{match.age}세</Text>
            </View>
          )}
          {match.jobCertificationSubmitted ? (
            <Feather name="check-circle" size={18} color={Colors.primary.electricCyan} />
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Feather name="map-pin" size={13} color={colors.text.muted} />
          <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
            {formatRegion(match.residence)}
          </Text>
          <View style={[styles.metaDivider, { backgroundColor: colors.border.primary }]} />
          <Feather name="briefcase" size={13} color={colors.text.muted} />
          <Text style={[styles.metaText, { color: colors.text.muted }]} numberOfLines={1}>
            {JOB_LABEL[match.job]}
          </Text>
        </View>

        {summaryExpandable ? (
          <View>
            <Text
              style={[styles.summaryText, { color: colors.text.secondary }]}
              numberOfLines={isSummaryExpanded ? undefined : 2}
              ellipsizeMode="tail"
            >
              &quot;{match.selfIntroduction}&quot;
            </Text>

            {/* 화면 밖에서 줄바꿈 제한 없이 렌더링해 실제 줄 수를 측정한다 — numberOfLines가
                걸린 위쪽 Text는 항상 최대 2줄만 보고하므로 이걸로는 잘렸는지 알 수 없다.
                폭/폰트가 위 Text와 완전히 같아야(기기·폰트 크기와 무관하게) 정확히 측정된다. */}
            <Text
              style={[styles.summaryText, styles.summaryMeasure]}
              onTextLayout={(e) => setIsSummaryTruncated(e.nativeEvent.lines.length > 2)}
              pointerEvents="none"
            >
              &quot;{match.selfIntroduction}&quot;
            </Text>

            {/* 더보기/접기는 상세 모달이 아니라 카드 안에서 텍스트만 펼치는 인라인 확장 —
                카드 배경 탭이 이미 모달을 여니, 여기서까지 같은 곳으로 보내면 중복이다. */}
            {isSummaryTruncated && (
              <TouchableOpacity
                onPress={() => setIsSummaryExpanded((prev) => !prev)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={isSummaryExpanded ? '자기소개 접기' : '자기소개 전체 보기'}
              >
                <Text style={styles.moreText}>{isSummaryExpanded ? '접기' : '더보기'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={[styles.summaryText, { color: colors.text.secondary }]} numberOfLines={1} ellipsizeMode="tail">
            &quot;{match.selfIntroduction}&quot;
          </Text>
        )}

        <View style={styles.tagRow}>
          <View style={[styles.chip, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
            <Text style={[styles.chipText, { color: Colors.primary.electricCyan }]}>{match.mbti}</Text>
          </View>
          {match.hashtags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.chip, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <Text style={[styles.chipText, { color: colors.text.secondary }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      <View style={[styles.buttonRow, { borderTopColor: colors.border.primary }]}>
        <TouchableOpacity
          style={styles.connectButtonWrapper}
          onPress={onConnectPress}
          disabled={!onConnectPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="통화하기"
        >
          <LinearGradient
            colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.connectButton}
          >
            <Feather name="phone" size={14} color={Colors.primary.soulBlack} />
            <Text style={[styles.buttonText, styles.connectButtonText]}>통화하기</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  photoBox: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFallbackText: {
    fontFamily: FontFamily.sans,
    fontSize: 64,
    fontWeight: FontWeight.black,
    color: Colors.neutral.pureWhite,
  },
  detailButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.black40,
    borderWidth: 1,
    borderColor: Colors.glass.white20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadge: {
    position: 'absolute',
    left: Spacing.lg,
    bottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
  },
  scoreBadgeText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: 10,
    letterSpacing: 0.2,
    color: Colors.primary.soulBlack,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nameText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flexShrink: 1,
  },
  metaDivider: {
    width: 1,
    height: 10,
    marginHorizontal: Spacing.xxs,
  },
  summaryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  // 실제 줄 수 측정 전용 — 화면에 보이지 않고 레이아웃 흐름에도 영향을 주지 않는다.
  // left/right:0으로 위 summaryText와 폭을 맞춰야 줄바꿈 지점이 동일하게 측정된다.
  summaryMeasure: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
  },
  moreText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xxs,
    color: Colors.primary.electricCyan,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  // 나이 배지/MBTI/해시태그가 전부 이 하나의 chip 스타일을 공유한다 — 색만
  // 텍스트에서 다르게 줘서(MBTI만 accent) "같은 모양 가족, 다른 의미"로 통일한다.
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  connectButtonWrapper: {
    flex: 1,
    height: 56,
    borderRadius: Radii.xl,
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  connectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radii.xl,
  },
  buttonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
    letterSpacing: 0.2,
  },
  connectButtonText: {
    color: Colors.primary.soulBlack,
  },
});
