import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {Colors, FontFamily, Radii, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatRelativeTime } from '@/src/utils/formatRelativeTime';
import type { ChatRoomSummary } from '@/src/types/api/chat';

interface MatchingChatItemProps {
  data: ChatRoomSummary;
  onPress?: () => void;
}

export default function MatchingChatItem({ data, onPress }: MatchingChatItemProps) {
  const { colors } = useThemeColors();
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);

  const { partner, lastMessage, unreadCount } = data;
  const isUnread = unreadCount > 0;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/chat/${data.chatRoomId}`);
    }
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      onPress={handlePress}
    >
      {/* 아바타 영역 */}
      <View style={styles.avatarContainer}>
        {!imageFailed && partner.profileImageUrl ? (
          <Image
            source={{ uri: partner.profileImageUrl }}
            style={[styles.avatarGradient, { borderColor: colors.border.primary }]}
            contentFit="cover"
            cachePolicy="disk"
            transition={150}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <LinearGradient
            colors={Colors.gradient.avatarPlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatarGradient, { borderColor: colors.border.primary }]}
          >
            <Text style={styles.avatarText}>{partner.name.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
        )}
      </View>

      {/* 정보 영역 */}
      <View style={styles.infoContainer}>
        {/* 이름 & 시간 & 안 읽음 배지 */}
        <View style={styles.headerRow}>
          <Text style={[styles.nameText, { color: colors.text.primary }]} numberOfLines={1}>
            {partner.name}
          </Text>
          {lastMessage && (
            <Text style={[styles.timeText, { color: colors.text.muted }]}>
              {formatRelativeTime(lastMessage.createdAt)}
            </Text>
          )}
          {isUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </View>

        {/* 마지막 메시지 */}
        <Text
          style={[
            styles.messageText,
            { color: isUnread ? colors.text.primary : colors.text.muted },
            isUnread && styles.messageTextUnread,
          ]}
          numberOfLines={1}
        >
          {lastMessage?.content ?? '대화를 시작해보세요'}
        </Text>

        {/* 하단 메타 데이터 */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.text.secondary }]}>
            {partner.age !== null ? `${partner.age}세 • ` : ''}
            {partner.twinSimilarity !== null ? `공감도 ${partner.twinSimilarity}%` : '공감도 분석 중'}
          </Text>
        </View>
      </View>

      {/* 우측 화살표 아이콘 */}
      <View style={[styles.actionIconContainer, { backgroundColor: Colors.glass.white05, borderColor: colors.border.primary }]}>
        <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg, // 기존 xl에서 lg로 약간 줄여서 슬림한 카드 UI 달성
    gap: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radii.lg2,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: Radii.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xl,
    letterSpacing: -0.45,
    color: Colors.neutral.pureWhite,
  },
  infoContainer: {
    flex: 1,
    gap: Spacing.xs, // 하드코딩 6 대신 디자인 시스템 토큰 사용
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameText: {
    flex: 1, // 이름이 길어질 경우 말줄임표시를 위해
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.lg,
    letterSpacing: -0.71,
  },
  timeText: {
    fontFamily: FontFamily.mono,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.xs,
    flexShrink: 0, // 시간이 줄어들지 않도록
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary.electricCyan,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  unreadBadgeText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: 10,
    color: Colors.primary.soulBlack,
  },
  messageText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    letterSpacing: -0.15,
  },
  messageTextUnread: {
    fontWeight: FontWeight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xxs,
  },
  metaText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    letterSpacing: 0.11,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
