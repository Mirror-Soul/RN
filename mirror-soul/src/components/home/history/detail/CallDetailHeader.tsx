import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';

interface CallDetailHeaderProps {
  name: string;
  age: number;
  consistencyPercent: number;
  isOnline?: boolean;
  onBack: () => void;
  onCallPress?: () => void;
  onMorePress?: () => void;
}

/**
 * 통화 상세 헤더 (SRP)
 * 채팅 헤더 스타일로 재설계:
 *   [뒤로가기] [아바타 + 이름/유사도/온라인 상태] [전화 버튼] [더보기 버튼]
 */
export default function CallDetailHeader({
  name,
  age,
  consistencyPercent,
  isOnline = false,
  onBack,
  onCallPress,
  onMorePress,
}: CallDetailHeaderProps) {
  return (
    <View style={styles.container}>
      {/* 뒤로가기 */}
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconButton}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Feather name="arrow-left" size={20} color={Colors.neutral.pureWhite} />
      </TouchableOpacity>

      {/* 아바타 + 이름/유사도 */}
      <View style={styles.profileSection}>
        {/* 아바타 */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{name[0]}</Text>
          </View>
          {isOnline && <View style={styles.onlineDot} />}
        </View>

        {/* 텍스트 정보 */}
        <View style={styles.textInfo}>
          <Text style={styles.nameText}>{name}</Text>
          <View style={styles.subRow}>
            <Text style={styles.consistencyText}>유사도 {consistencyPercent}%</Text>
            <View style={styles.dot} />
            {isOnline && (
              <Text style={styles.onlineText}>상대방이 읽음</Text>
            )}
          </View>
        </View>
      </View>

      {/* 우측 액션 버튼 */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onCallPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="통화"
        >
          <Feather name="phone" size={16} color={Colors.neutral.pureWhite} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onMorePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="더보기"
        >
          <Feather name="more-vertical" size={16} color={Colors.neutral.pureWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 0.612,
    borderBottomColor: Colors.glass.white10,
    backgroundColor: Colors.glass.black40,
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.lg,
    backgroundColor: Colors.glass.cyan20_d3,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.successGreen,
    borderWidth: 1.5,
    borderColor: Colors.primary.soulBlack,
  },
  textInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  nameText: {
    color: Colors.neutral.pureWhite,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.15,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  consistencyText: {
    color: Colors.neutral.darkGray,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: Radii.full,
    backgroundColor: Colors.neutral.darkGray,
  },
  onlineText: {
    color: Colors.primary.successGreen,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white10,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
