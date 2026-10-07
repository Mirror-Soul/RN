import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRetryableProfileImage } from '@/src/features/profile/photo/useRetryableProfileImage';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { formatRelativeTime } from '@/src/utils/formatRelativeTime';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ChatRoom } from '../types';

interface MessageRoomHeaderLeftProps {
  room: ChatRoom;
}

export function MessageRoomHeaderLeft({ room }: MessageRoomHeaderLeftProps) {
  const { partner } = room;
  const photo = useRetryableProfileImage(partner.profileImageUrl);
  const { colors } = useThemeColors();

  return (
    <View style={styles.headerLeft}>
      {/* 아바타 */}
      <View style={styles.avatarWrapper}>
        {!photo.failed && partner.profileImageUrl ? (
          <Image
            key={photo.imageKey}
            source={{ uri: partner.profileImageUrl }}
            style={styles.headerAvatar}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
            onError={photo.onError}
          />
        ) : photo.failed ? (
          <Pressable style={styles.headerAvatar} hitSlop={4} accessibilityRole="button" accessibilityLabel={`${partner.name} 프로필 사진 다시 불러오기`}
            disabled={photo.isReloading} onPress={() => { void photo.retry(); }}><Feather name="refresh-cw" size={20} color={colors.text.secondary} /></Pressable>
        ) : (
          <LinearGradient
            colors={Colors.gradient.voiceStart}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerAvatar}
          >
            <Text style={styles.headerAvatarText}>{partner.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        )}
      </View>

      {/* 이름 + 메타 */}
      <View style={styles.headerInfo}>
        <Text style={[styles.headerName, { color: colors.text.primary }]} numberOfLines={1}>
          {partner.name}
        </Text>
        <View style={styles.headerMeta}>
          <Text style={[styles.headerMetaText, { color: colors.text.secondary }]}>
            {partner.twinSimilarity !== null ? `유사도 ${partner.twinSimilarity}%` : '유사도 분석 중'}
          </Text>
          <View style={[styles.metaDot, { backgroundColor: colors.text.muted }]} />
          <Text style={[styles.headerMetaText, { color: colors.text.secondary }]}>
            {partner.lastActiveAt ? formatRelativeTime(partner.lastActiveAt) : '활동 정보 없음'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    position: 'relative',
    flexShrink: 0,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    letterSpacing: -0.31,
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.xxs,
  },
  headerName: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.5,
    color: Colors.neutral.pureWhite,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerMetaText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 0.12,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: Radii.full,
  },
});
