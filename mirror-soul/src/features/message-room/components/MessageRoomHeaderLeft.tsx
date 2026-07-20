import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { ChatRoom } from '../types';

interface MessageRoomHeaderLeftProps {
  room: ChatRoom;
}

export function MessageRoomHeaderLeft({ room }: MessageRoomHeaderLeftProps) {
  return (
    <View style={styles.headerLeft}>
      {/* 아바타 + 온라인 닷 */}
      <View style={styles.avatarWrapper}>
        <LinearGradient
          colors={Colors.gradient.twinCallButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerAvatar}
        >
          <Text style={styles.headerAvatarText}>{room.avatarLetter}</Text>
        </LinearGradient>
        {room.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* 이름 + 메타 */}
      <View style={styles.headerInfo}>
        <Text style={styles.headerName} numberOfLines={1}>
          {room.name}
        </Text>
        <View style={styles.headerMeta}>
          <Text style={styles.headerMetaText}>유사도 {room.resonance}%</Text>
          <View style={styles.metaDot} />
          <Text style={[styles.headerMetaText, styles.readText]}>
            {room.isRead ? '상대방이 읽음' : '읽지 않음'}
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
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.electricCyan,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 4,
  },
  headerAvatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg,
    lineHeight: 24,
    letterSpacing: -0.31,
    color: Colors.neutral.pureWhite,
  },
  onlineDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: Radii.full,
    backgroundColor: '#00C950',
    borderWidth: 2,
    borderColor: '#000000',
    right: -2,
    bottom: -2,
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
    color: Colors.neutral.darkGray,
  },
  readText: {
    color: '#00C950',
    opacity: 0.51,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: Radii.full,
    backgroundColor: Colors.neutral.disabledText,
  },
});
