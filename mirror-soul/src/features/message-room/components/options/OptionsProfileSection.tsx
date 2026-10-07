import React from 'react';
import { useRetryableProfileImage } from '@/src/features/profile/photo/useRetryableProfileImage';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ChatRoom } from '../../types';

interface OptionsProfileSectionProps {
  room: ChatRoom;
  onPress: () => void;
}

/** 채팅방 목록의 요약 정보와 추천 상세 API 진입점을 함께 제공한다. */
export function OptionsProfileSection({ room, onPress }: OptionsProfileSectionProps) {
  const { partner } = room;
  const photo = useRetryableProfileImage(partner.profileImageUrl);
  const { colors } = useThemeColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.profileSection,
        { backgroundColor: colors.background.glass, opacity: pressed ? 0.76 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${partner.name} 상세 프로필 보기`}
    >
      <View style={styles.profileTopRow}>
        {!photo.failed && partner.profileImageUrl ? (
          <Image
            key={photo.imageKey}
            source={{ uri: partner.profileImageUrl }}
            style={styles.largeAvatar}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
            onError={photo.onError}
          />
        ) : photo.failed ? (
          <Pressable style={styles.largeAvatar} accessibilityRole="button" accessibilityLabel={`${partner.name} 프로필 사진 다시 불러오기`}
            disabled={photo.isReloading} onPress={() => { void photo.retry(); }}><Feather name="refresh-cw" size={20} color={colors.text.secondary} /></Pressable>
        ) : (
          <LinearGradient
            colors={Colors.gradient.voiceStart}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.largeAvatar}
          >
            <Text style={styles.largeAvatarText}>{partner.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        )}
        <View style={styles.profileCopy}>
          <Text style={[styles.profileName, { color: colors.text.primary }]} numberOfLines={1}>
            {partner.name}
          </Text>
          <Text style={[styles.profileMeta, { color: colors.text.secondary }]}>프로필 자세히 보기</Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.text.muted} />
      </View>
      <View style={[styles.similarityPill, { backgroundColor: Colors.glass.purple10 }]}>
        <Feather name="star" size={13} color={Colors.primary.vividPurple} />
        <Text style={[styles.similarityText, { color: colors.text.secondary }]}>
          {partner.twinSimilarity !== null ? `트윈 유사도 ${partner.twinSimilarity}%` : '트윈 유사도 분석 중'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  largeAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xl,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: Colors.neutral.pureWhite,
  },
  profileName: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.lg,
    lineHeight: 22,
    letterSpacing: -0.44,
    flexShrink: 1,
  },
  profileCopy: {
    flex: 1,
  },
  profileMeta: {
    marginTop: Spacing.xxs,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
  similarityPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full,
  },
  similarityText: {
    marginLeft: Spacing.xs,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
    lineHeight: 15,
  },
});
