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

interface DiscoveryMatchCardProps {
  match: Recommendation;
  onOpenDetail?: (match: Recommendation) => void;
}

/**
 * DiscoveryMatchCard 컴포넌트 (SRP)
 * 발견 탭 추천 카드 UI만 담당하는 순수 프레젠테이션 컴포넌트입니다.
 * 패스/통화하기 액션은 DiscoveryActionFooter(카드 밖)로 분리되어 있다 — 이 카드는
 * 정보 표시 + 상세 모달 진입(더보기)만 책임진다.
 */
export default function DiscoveryMatchCard({ match, onOpenDetail }: DiscoveryMatchCardProps) {
  const { colors } = useThemeColors();
  const [imageFailed, setImageFailed] = useState(false);
  const isScoreKnown = Number.isFinite(match.recommendationScore);

  return (
    <View style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      {/* 상단: 고정 비율 사진 박스 (풀블리드 아님) */}
      <View style={styles.photoBox}>
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

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => onOpenDetail?.(match)}
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
      </View>

      {/* 하단: 글래스 카드 정보 섹션 */}
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>
            {match.name}
            {match.age !== null ? <Text style={styles.ageText}> {match.age}</Text> : null}
          </Text>
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

        <Text style={[styles.summaryText, { color: colors.text.secondary }]} numberOfLines={2} ellipsizeMode="tail">
          &quot;{match.selfIntroduction}&quot;
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.mbtiChip}>
            <Text style={styles.mbtiChipText}>{match.mbti}</Text>
          </View>
          {match.hashtags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tagChip, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
              <Text style={[styles.tagChipText, { color: colors.text.secondary }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: Radii.xxl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoBox: {
    width: '100%',
    aspectRatio: 4 / 5,
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
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameText: {
    flex: 1,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
  },
  ageText: {
    fontWeight: FontWeight.regular,
    color: Colors.neutral.darkGray,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
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
    lineHeight: 19,
    marginTop: Spacing.xxs,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xxs,
  },
  mbtiChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white10,
    borderWidth: 1,
    borderColor: Colors.glass.white20,
  },
  mbtiChipText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    fontWeight: FontWeight.black,
    letterSpacing: 0.6,
    color: Colors.neutral.pureWhite,
  },
  tagChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xxs,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  tagChipText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
});
