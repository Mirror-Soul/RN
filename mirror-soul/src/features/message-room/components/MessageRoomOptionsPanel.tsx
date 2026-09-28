import React, { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ChatRoom } from '../types';
import { OptionsProfileSection } from './options/OptionsProfileSection';
import { OptionsSettingsSection } from './options/OptionsSettingsSection';
import { OptionsDangerSection } from './options/OptionsDangerSection';

interface MessageRoomOptionsPanelProps {
  room: ChatRoom;
  isOpen: boolean;
  onClose: () => void;
  /** 차단 완료 후 호출 (대화방에서 나가기 등) */
  onBlocked: () => void;
}

const PANEL_WIDTH = 280;
const ANIMATION_DURATION = 280;

/**
 * 메시지방 옵션 사이드 패널
 *
 * 더보기 버튼 탭 시 우측에서 슬라이드 인 되는 패널입니다.
 *
 * 구현된 서버 동작을 중심으로 한다.
 * - 메시지 알림: GET/PATCH /chat/rooms/{room-id}/notification
 * - 차단: POST /blocks/{target-user-uuid}
 * 신고는 서버 신고 API가 없어 고객센터 이메일로 연결한다.
 */
export default function MessageRoomOptionsPanel({
  room,
  isOpen,
  onClose,
  onBlocked,
}: MessageRoomOptionsPanelProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();

  // 패널 translateX: PANEL_WIDTH(숨김) → 0(보임)
  const translateX = useSharedValue(PANEL_WIDTH);
  // 오버레이 opacity
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      overlayOpacity.value = withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      translateX.value = withSpring(0, {
        damping: 22,
        stiffness: 200,
        mass: 0.8,
      });
    } else {
      overlayOpacity.value = withTiming(0, {
        duration: ANIMATION_DURATION - 40,
        easing: Easing.in(Easing.cubic),
      });
      translateX.value = withTiming(PANEL_WIDTH, {
        duration: ANIMATION_DURATION - 40,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [isOpen, overlayOpacity, translateX]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.root, { height: screenHeight }]} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* ── 오버레이 ── */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: colors.background.elevated,
            borderLeftColor: colors.border.primary,
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
          panelStyle,
        ]}
      >
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: colors.text.primary }]}>대화 설정</Text>
          <Pressable
            style={[styles.headerCloseButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="대화 설정 닫기"
          >
            <Text style={[styles.headerCloseText, { color: colors.text.secondary }]}>닫기</Text>
          </Pressable>
        </View>
        <OptionsProfileSection room={room} />
        <OptionsSettingsSection roomId={room.chatRoomId} isActive={isOpen} />
        <OptionsDangerSection room={room} onBlocked={onBlocked} />

        <View style={styles.closeSection}>
          <View style={[styles.closeDivider, { backgroundColor: colors.border.primary }]} />
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={[styles.closeButtonText, { color: colors.text.secondary }]}>대화로 돌아가기</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  /* ── 패널 ── */
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    borderLeftWidth: 1,
    flexDirection: 'column',
    paddingHorizontal: Spacing.xxl,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  panelTitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xl,
    letterSpacing: -0.4,
  },
  headerCloseButton: {
    borderWidth: 1,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerCloseText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.xs,
  },

  /* ── 닫기 버튼 ── */
  closeSection: {
    marginTop: 'auto' as any,
    alignSelf: 'stretch',
  },
  closeDivider: {
    height: 1,
    marginBottom: Spacing.xxl,
  },
  closeButton: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});
