import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
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
  onViewProfile: () => void;
  /** 차단 완료 후 호출 (대화방에서 나가기 등) */
  onBlocked: () => void;
}

/**
 * Android와 iOS 모두에서 자연스럽게 동작하는 하단 액션 시트.
 * 기존의 좁은 우측 패널 대신 화면 폭을 활용해 읽기·탭 영역을 확보한다.
 */
export default function MessageRoomOptionsPanel({
  room,
  isOpen,
  onClose,
  onViewProfile,
  onBlocked,
}: MessageRoomOptionsPanelProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useThemeColors();
  const sheetWidth = Math.min(width, 560);

  const handleViewProfile = () => {
    onClose();
    // Modal의 닫힘이 먼저 반영된 다음 상세 Modal을 열어 Android에서 두 레이어가 겹치지 않게 한다.
    setTimeout(onViewProfile, 180);
  };

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View entering={FadeIn.duration(160)} style={[styles.overlay, { backgroundColor: colors.background.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="대화 메뉴 닫기" />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(260)}
          style={[
            styles.sheet,
            {
              width: sheetWidth,
              backgroundColor: colors.background.elevated,
              paddingBottom: Math.max(insets.bottom, Spacing.lg),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border.strong }]} />
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text.primary }]}>대화 정보</Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>이 대화방의 설정과 안전 기능을 관리해요.</Text>
            </View>
            <Pressable
              style={[styles.closeButton, { backgroundColor: colors.background.glass }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="대화 메뉴 닫기"
            >
              <Feather name="x" size={20} color={colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
            <OptionsProfileSection room={room} onPress={handleViewProfile} />
            <OptionsSettingsSection roomId={room.chatRoomId} isActive={isOpen} />
            <OptionsDangerSection room={room} onBlocked={onBlocked} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 18,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: Radii.full,
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.black,
    fontSize: FontSize.xl,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
});
