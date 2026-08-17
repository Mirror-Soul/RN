import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * 가치관 밸런스 게임(성장 탭) 답변을 축(axis)별로 집계한 성향 결과.
 * 백엔드 UserValueAxisScore(-1~1 스코어)를 사람이 읽을 수 있는 한 줄 성향으로
 * 요약한 값이라고 가정한 목업 — 실제 매칭 상세 API가 생기면 이 모양 그대로 교체될 예정.
 */
export interface ValueTendency {
  axisLabel: string;
  description: string;
}

/**
 * MBTI 4개 축 성향 강도. 백엔드 MbtiProfile의 ieScore/nsScore/ftScore/pjScore를
 * "왼쪽 글자(E/S/T/J) 쪽으로 얼마나 기울었는지"(0~100)로 정규화했다고 가정한 목업.
 */
export interface MbtiAxisScores {
  E: number;
  S: number;
  T: number;
  J: number;
}

export interface SoulMatch {
  id: string;
  name: string;
  age: number;
  location: string;
  profileImage: string;
  job: string;
  isJobVerified: boolean;
  mbti: string;
  mbtiAxisScores: MbtiAxisScores;
  compatibility: number;
  /** Clone.summary — AI가 트윈 데이터를 바탕으로 쓴 한 줄 소개 */
  cloneSummary: string;
  bio: string;
  voiceStyle: string;
  aiAnalysisTags: string[];
  valueTendencies: ValueTendency[];
}

interface DiscoveryMatchCardProps {
  match: SoulMatch;
  onPass?: (id: string) => void;
  onConnect?: (id: string) => void;
  onOpenDetail?: (match: SoulMatch) => void;
}

/**
 * DiscoveryMatchCard 컴포넌트 (SRP)
 * 발견 탭 히어로 카드 UI만 담당하는 순수 프레젠테이션 컴포넌트입니다.
 * 상태(현재 인덱스, 전환 애니메이션)는 DiscoveryMatchSection이 관리합니다.
 */
export default function DiscoveryMatchCard({ match, onPass, onConnect, onOpenDetail }: DiscoveryMatchCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View style={styles.card}>
      {imageFailed ? (
        <LinearGradient colors={Colors.gradient.avatarPlaceholder} style={styles.image}>
          <Text style={styles.imageFallbackText}>{match.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      ) : (
        <Image
          source={{ uri: match.profileImage }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
          transition={150}
          onError={() => setImageFailed(true)}
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.2)', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => onOpenDetail?.(match)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="상세 프로필 보기"
        >
          <Feather name="chevron-right" size={20} color={Colors.neutral.pureWhite} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContent}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>
            {match.name}
            <Text style={styles.ageText}> {match.age}</Text>
          </Text>
          {match.isJobVerified ? (
            <Feather name="check-circle" size={20} color={Colors.primary.electricCyan} />
          ) : null}
        </View>

        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={Colors.neutral.lightGray} />
          <Text style={styles.locationText}>{match.location}</Text>
        </View>

        <Text style={styles.summaryText} numberOfLines={1} ellipsizeMode="tail">
          &quot;{match.cloneSummary}&quot;
        </Text>

        <View style={styles.tagRow}>
          <View style={styles.mbtiChip}>
            <Text style={styles.mbtiChipText}>{match.mbti}</Text>
          </View>
          {match.aiAnalysisTags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.passButton}
            onPress={() => onPass?.(match.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="패스"
          >
            <Feather name="x" size={24} color={Colors.neutral.pureWhite} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onConnect?.(match.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="통화하기"
            style={styles.connectButtonWrapper}
          >
            <LinearGradient
              colors={[Colors.primary.electricCyan, Colors.primary.vividPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.connectButton}
            >
              <Feather name="phone" size={16} color={Colors.neutral.pureWhite} />
              <Text style={styles.connectText}>통화하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: Radii.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.primary.cardBlack,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFallbackText: {
    fontFamily: FontFamily.sans,
    fontSize: 64,
    fontWeight: FontWeight.black,
    color: Colors.neutral.pureWhite,
  },
  topRow: {
    position: 'absolute',
    top: Spacing.xxl,
    right: Spacing.xxl,
  },
  detailButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.black40,
    borderWidth: 1,
    borderColor: Colors.glass.white20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContent: {
    position: 'absolute',
    left: Spacing.xxxl,
    right: Spacing.xxxl,
    bottom: Spacing.xxxl,
    gap: Spacing.xxl,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  nameText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    letterSpacing: -1.4,
    color: Colors.neutral.pureWhite,
  },
  ageText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.regular,
    color: Colors.neutral.darkGray,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: -Spacing.lg,
  },
  locationText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.neutral.lightGray,
  },
  summaryText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral.lightGray,
    marginTop: -Spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
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
    backgroundColor: Colors.glass.cyan10_d3,
    borderWidth: 1,
    borderColor: Colors.glass.cyan20_d3,
  },
  tagChipText: {
    fontFamily: FontFamily.sans,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primary.electricCyan,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  passButton: {
    width: 56,
    height: 56,
    borderRadius: Radii.xl,
    backgroundColor: Colors.glass.white5,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButtonWrapper: {
    flex: 1,
  },
  connectButton: {
    height: 56,
    borderRadius: Radii.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  connectText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    letterSpacing: 1.16,
    textTransform: 'uppercase',
    color: Colors.neutral.pureWhite,
  },
});
