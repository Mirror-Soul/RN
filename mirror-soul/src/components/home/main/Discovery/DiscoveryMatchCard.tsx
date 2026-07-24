import CancelIcon from '@/assets/images/common/Cancel.svg';
import HeartIcon from '@/assets/images/common/main/Heart.svg';
import LocationIcon from '@/assets/images/common/Location.svg';
import RightNarrowIcon from '@/assets/images/common/Right_narrow.svg';
import VerifiedIcon from '@/assets/images/common/Verification_protect_icon.svg';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface SoulMatch {
  id: string;
  name: string;
  age: number;
  location: string;
  profileImage: string;
  job: string;
  isJobVerified: boolean;
  mbti: string;
  compatibility: number;
  bio: string;
  voiceStyle: string;
  aiAnalysisTags: string[];
  interests: { label: string }[];
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
  return (
    <View style={styles.card}>
      <Image source={{ uri: match.profileImage }} style={styles.image} resizeMode="cover" />
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
          <RightNarrowIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContent}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>
            {match.name}
            <Text style={styles.ageText}> {match.age}</Text>
          </Text>
          {match.isJobVerified ? <VerifiedIcon width={20} height={20} /> : null}
        </View>

        <View style={styles.locationRow}>
          <LocationIcon width={14} height={14} />
          <Text style={styles.locationText}>{match.location}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.passButton}
            onPress={() => onPass?.(match.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="패스"
          >
            <CancelIcon width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => onConnect?.(match.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Soul Connect"
          >
            <HeartIcon width={16} height={16} />
            <Text style={styles.connectText}>Soul Connect</Text>
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
  connectButton: {
    flex: 1,
    height: 56,
    borderRadius: Radii.xl,
    backgroundColor: Colors.neutral.pureWhite,
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
    color: Colors.primary.soulBlack,
  },
});
