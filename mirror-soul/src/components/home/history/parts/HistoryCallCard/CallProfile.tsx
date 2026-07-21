import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { Feather } from '@expo/vector-icons';

interface CallAvatarProps {
  name: string;
  profileImageUrl?: string;
  direction: 'SENT' | 'RECEIVED';
}

/**
 * 통화 카드 아바타 컴포넌트 (SRP)
 * 프로필 이미지(또는 이니셜) + 우하단 방향 배지를 렌더링합니다.
 * - RECEIVED(받음): electricCyan 배경 + arrow-down-left
 * - SENT(보냄): vividPurple 배경 + arrow-up-right
 */
export default function CallAvatar({ name, profileImageUrl, direction }: CallAvatarProps) {
  const isReceived = direction === 'RECEIVED';
  const badgeColor = isReceived ? Colors.primary.electricCyan : Colors.primary.vividPurple;
  const arrowIcon = isReceived ? 'arrow-down-left' : 'arrow-up-right';

  return (
    <View style={styles.wrapper}>
      {/* 프로필 이미지 또는 이니셜 */}
      {profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.initialText}>{name[0]}</Text>
        </View>
      )}

      {/* 방향 배지 */}
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Feather name={arrowIcon} size={10} color={Colors.primary.soulBlack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 48,
    height: 48,
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.glass.white10,
    borderWidth: 0.612,
    borderColor: Colors.glass.white15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: Colors.neutral.lightGrayText,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary.soulBlack,
  },
});
