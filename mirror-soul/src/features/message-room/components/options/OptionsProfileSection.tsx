import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ChatRoom } from '../../types';

interface OptionsProfileSectionProps {
  room: ChatRoom;
}

export function OptionsProfileSection({ room }: OptionsProfileSectionProps) {
  const { partner } = room;
  const [imageFailed, setImageFailed] = useState(false);
  const { colors } = useThemeColors();

  return (
    <View style={[styles.profileSection, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
      <View style={styles.profileTopRow}>
        {!imageFailed && partner.profileImageUrl ? (
          <Image
            source={{ uri: partner.profileImageUrl }}
            style={styles.largeAvatar}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <LinearGradient
            colors={Colors.gradient.twinCallButton}
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
          <Text style={[styles.profileMeta, { color: colors.text.secondary }]}>현재 연결된 대화 상대</Text>
        </View>
      </View>
      <View style={[styles.similarityPill, { backgroundColor: Colors.glass.cyan10_d3 }]}>
        <Feather name="zap" size={13} color={Colors.primary.electricCyan} />
        <Text style={[styles.similarityText, { color: colors.text.secondary }]}>
          {partner.twinSimilarity !== null ? `트윈 유사도 ${partner.twinSimilarity}%` : '트윈 유사도 분석 중'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    borderWidth: 1,
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
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
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
