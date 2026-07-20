import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { MessageItem } from '../types';

interface MessageBubbleProps {
  message: MessageItem;
  /** 상대방 아바타 이니셜 (수신 메시지에만 표시) */
  avatarLetter: string;
  /** 상대방 아바타 그라디언트 */
  avatarGradient: [string, string];
  /** 애니메이션 진입 딜레이(ms) — stagger 효과용 */
  enterDelay?: number;
  /** 연속된 수신 메시지에서 아바타를 숨길지 여부 */
  hideAvatar?: boolean;
}

/**
 * 단일 메시지 말풍선 컴포넌트
 *
 * - RECEIVED: 좌측 정렬, 반투명 글래스 배경, 상대 아바타 표시
 * - SENT: 우측 정렬, 시안→블루 그라디언트 배경
 *
 * 디자인 시스템:
 *   - 수신 말풍선: Colors.glass.white10 배경, Colors.glass.white05 border
 *   - 송신 말풍선: Colors.gradient.twinCallButton
 *   - borderRadius: Radii.bubble (origin 모서리) + Radii.lg (나머지)
 */
export default function MessageBubble({
  message,
  avatarLetter,
  avatarGradient,
  enterDelay = 0,
  hideAvatar = false,
}: MessageBubbleProps) {
  const isSent = message.direction === 'SENT';

  if (isSent) {
    return (
      <Animated.View
        entering={FadeInUp.delay(enterDelay).duration(300).springify()}
        style={styles.sentRow}
      >
        {/* 시간 텍스트 */}
        <View style={styles.timePad}>
          <Text style={styles.timeText}>{message.timestamp}</Text>
        </View>

        {/* 말풍선: 그라디언트 (twinCallButton) */}
        <LinearGradient
          colors={Colors.gradient.twinCallButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubbleBase,
            styles.sentBubble,
          ]}
        >
          <Text style={styles.sentText}>{message.text}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  // RECEIVED
  return (
    <Animated.View
      entering={FadeInUp.delay(enterDelay).duration(300).springify()}
      style={styles.receivedRow}
    >
      {/* 아바타 (연속 메시지에서 반복 시 hideAvatar로 공간 유지) */}
      <View style={styles.avatarSlot}>
        {!hideAvatar && (
          <LinearGradient
            colors={avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </LinearGradient>
        )}
      </View>

      {/* 말풍선: 반투명 글래스 */}
      <View style={styles.receivedBubbleWrapper}>
        <View style={[styles.bubbleBase, styles.receivedBubble]}>
          <Text style={styles.receivedText}>{message.text}</Text>
        </View>
        {/* 시간 텍스트 */}
        <View style={styles.timePadReceived}>
          <Text style={styles.timeText}>{message.timestamp}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  /* ─── SENT ─── */
  sentRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    paddingTop: Spacing.lg,
    paddingLeft: Spacing.xxxl,   // 최대 너비 제한
  },
  sentBubble: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.bubble,
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    flexShrink: 1,
  },
  sentText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 23,
    letterSpacing: -0.15,
    color: Colors.primary.soulBlack,
  },

  /* ─── RECEIVED ─── */
  receivedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    paddingRight: Spacing.xxxl,  // 최대 너비 제한
  },
  avatarSlot: {
    width: 28,
    height: 28,
    flexShrink: 0,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: Radii.smmd,
    borderWidth: 1,
    borderColor: Colors.glass.white05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 0.12,
    color: Colors.primary.electricCyan,
  },
  receivedBubbleWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  receivedBubble: {
    borderTopLeftRadius: Radii.bubble,
    borderTopRightRadius: Radii.lg,
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    backgroundColor: Colors.glass.white10,
    borderColor: Colors.glass.white05,
    flexShrink: 1,
    alignSelf: 'flex-start',
  },
  receivedText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 23,
    letterSpacing: -0.15,
    color: Colors.neutral.pureWhite,
  },

  /* ─── SHARED ─── */
  bubbleBase: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.glass.white05,
    // iOS shadow
    shadowColor: Colors.primary.soulBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timePad: {
    paddingBottom: Spacing.xs,
    paddingRight: Spacing.xs,
  },
  timePadReceived: {
    paddingTop: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
  timeText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 0.12,
    color: Colors.neutral.disabledText,
  },
});
