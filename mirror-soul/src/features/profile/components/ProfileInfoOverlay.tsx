import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Badge } from '@/src/components/common/Badge';
import {Colors, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ProfileViewData } from '../types';

interface ProfileInfoOverlayProps
  extends Pick<
    ProfileViewData,
    | 'name'
    | 'age'
    | 'mbti'
    | 'twinSimilarity'
    | 'location'
    | 'job'
    | 'isPremium'
    | 'isOwnProfile'
  > {
  onEditPress?: () => void;
}

export const ProfileInfoOverlay = ({
  name,
  age,
  mbti,
  twinSimilarity,
  location,
  job,
  isPremium,
  isOwnProfile,
  onEditPress,
}: ProfileInfoOverlayProps) => {
  const { colors } = useThemeColors();

  return (
    <Animated.View
      entering={FadeInUp.delay(80).duration(550).springify()}
      style={styles.container}
    >
      {/* 상단 뱃지 Row */}
      <View style={styles.badgeRow}>
        <Badge 
          label={`MY TWIN SIMILARITY ${twinSimilarity}%`}
          colorScheme="cyan" 
          variant="solid" 
          size="sm"
        />
        
        <Badge 
          label={mbti} 
          colorScheme="gray" 
          variant="outline" 
          size="sm"
        />
      </View>

      {/* 이름 + 나이 Row */}
      <View style={styles.nameRow}>
        <Text style={[styles.nameText, { color: colors.text.primary }]}>{name}</Text>
        <Text style={[styles.ageText, { color: colors.text.muted }]}> {age}</Text>

        {/* 편집 아이콘 (내 프로필만) */}
        {isOwnProfile && !!onEditPress && (
          <Pressable 
            onPress={onEditPress} 
            style={styles.editButton} 
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="프로필 수정"
          >
            <Feather name="edit-2" size={14} color={colors.text.secondary} />
          </Pressable>
        )}
      </View>

      {/* 지역 + 직업 + 프리미엄 메타 Row */}
      <View style={styles.metaRow}>
        {/* 지역 */}
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={14} color={colors.text.muted} />
          <Text style={[styles.metaText, { color: colors.text.secondary }]}>{location}</Text>
        </View>

        {/* 직업 */}
        <View style={styles.metaItem}>
          <Feather name="briefcase" size={14} color={colors.text.muted} />
          <Text style={[styles.metaText, { color: colors.text.secondary }]}>{job}</Text>
        </View>

        {/* 프리미엄 아이콘 */}
        {isPremium && (
          <Feather name="zap" size={14} color={Colors.primary.electricCyan} />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.none,
  },

  // 뱃지 Row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  // 이름 Row
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  nameText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.giant,
    lineHeight: 48,
    letterSpacing: -2.05,
  },
  ageText: {
    fontFamily: FontFamily.sans,
    fontWeight: '300',
    fontSize: FontSize.giant,
    lineHeight: 48,
    letterSpacing: -2.05,
  },
  editButton: {
    paddingTop: Spacing.sm,
    paddingLeft: Spacing.sm,
    alignSelf: 'flex-end',
    paddingBottom: Spacing.xs,
  },

  // 메타 Row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
