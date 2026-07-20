import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Switch,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { ChatRoom } from '../types';
import { OptionsProfileSection } from './options/OptionsProfileSection';
import { OptionsSettingsSection } from './options/OptionsSettingsSection';
import { OptionsDangerSection } from './options/OptionsDangerSection';

interface MessageRoomOptionsPanelProps {
  room: ChatRoom;
  isOpen: boolean;
  onClose: () => void;
}

const PANEL_WIDTH = 280;
const ANIMATION_DURATION = 280;

/**
 * 메시지방 옵션 사이드 패널
 *
 * 더보기 버튼 탭 시 우측에서 슬라이드 인 되는 패널입니다.
 *
 * 구성:
 * - 오버레이 (반투명 블랙, 탭 시 닫기)
 * - 패널 (우측 고정 280px):
 *   - 상대 프로필 (대형 아바타 + 이름 + 나이/유사도)
 *   - SETTINGS 섹션: 알림 설정 토글, 시간 채우기(선물), 프로필 상세보기
 *   - DANGER ZONE 섹션: 대화 내용 삭제, 차단하기
 *   - 닫기 버튼 (하단 고정)
 */
export default function MessageRoomOptionsPanel({
  room,
  isOpen,
  onClose,
}: MessageRoomOptionsPanelProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

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
          { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.lg },
          panelStyle,
        ]}
      >
        <OptionsProfileSection room={room} />
        <OptionsSettingsSection />
        <OptionsDangerSection />

        {/* ─ 닫기 버튼 (하단 고정) ─ */}
        <View style={styles.closeSection}>
          <View style={styles.closeDivider} />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
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
    backgroundColor: '#0F0F0F',
    borderLeftWidth: 1,
    borderLeftColor: Colors.glass.white05,
    flexDirection: 'column',
    paddingHorizontal: Spacing.xxl,
  },

  /* ── 닫기 버튼 ── */
  closeSection: {
    marginTop: 'auto' as any,
    alignSelf: 'stretch',
  },
  closeDivider: {
    height: 1,
    backgroundColor: Colors.glass.white05,
    marginBottom: Spacing.xxl,
  },
  closeButton: {
    backgroundColor: Colors.glass.white05,
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: Colors.neutral.lightGray,
  },
});
