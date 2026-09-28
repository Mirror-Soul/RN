import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { MessageItem } from '../types';

interface MessageBubbleProps {
  message: MessageItem;
  avatarLetter: string;
  avatarGradient: readonly [string, string, ...string[]];
  enterDelay?: number;
  hideAvatar?: boolean;
}

/**
 * 채팅의 읽기 흐름을 방해하지 않도록 송·수신 말풍선을 낮은 채도의 표면색으로 구분한다.
 * 강한 블루 그라디언트·검은 테두리·과한 그림자는 쓰지 않는다.
 */
export default function MessageBubble({
  message,
  avatarLetter,
  avatarGradient,
  enterDelay = 0,
  hideAvatar = false,
}: MessageBubbleProps) {
  const isSent = message.direction === 'SENT';
  const { colors, isDark } = useThemeColors();
  const sentBackground = isDark ? 'rgba(194, 122, 255, 0.20)' : 'rgba(108, 75, 142, 0.13)';

  if (isSent) {
    return (
      <Animated.View entering={FadeInUp.delay(enterDelay).duration(220)} style={styles.sentRow}>
        <View style={styles.timePad}>
          {message.isReadByPartner && <Text style={[styles.readLabel, { color: Colors.primary.vividPurple }]}>읽음</Text>}
          <Text style={[styles.timeText, { color: colors.text.muted }]}>{message.timestamp}</Text>
        </View>
        <View style={[styles.bubbleBase, styles.sentBubble, { backgroundColor: sentBackground }]}>
          <Text style={[styles.sentText, { color: colors.text.primary }]}>{message.text}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.delay(enterDelay).duration(220)} style={styles.receivedRow}>
      <View style={styles.avatarSlot}>
        {!hideAvatar && (
          <LinearGradient colors={avatarGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </LinearGradient>
        )}
      </View>

      <View style={styles.receivedBubbleWrapper}>
        <View style={[styles.bubbleBase, styles.receivedBubble, { backgroundColor: colors.background.elevated }]}>
          <Text style={[styles.receivedText, { color: colors.text.primary }]}>{message.text}</Text>
        </View>
        <View style={styles.timePadReceived}>
          <Text style={[styles.timeText, { color: colors.text.muted }]}>{message.timestamp}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sentRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
    paddingLeft: Spacing.massive,
  },
  sentBubble: {
    maxWidth: '78%',
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.sm,
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
  },
  sentText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  receivedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingRight: Spacing.massive,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    lineHeight: 15,
    color: Colors.neutral.pureWhite,
  },
  receivedBubbleWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    maxWidth: '84%',
    borderTopLeftRadius: Radii.sm,
    borderTopRightRadius: Radii.lg,
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
  },
  receivedText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  bubbleBase: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  timePad: {
    alignItems: 'flex-end',
    paddingBottom: Spacing.xs,
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
  },
  readLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xs,
    lineHeight: 15,
  },
});
