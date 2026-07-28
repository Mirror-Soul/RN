import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '@/src/constants/theme';
import { blockRoom } from '@/src/utils/blockList';
import { SUPPORT_EMAIL } from '@/src/features/customer-center/constants/faqData';
import { logger } from '@/src/utils/logger';
import { ChatRoom } from '../../types';

interface OptionsDangerSectionProps {
  room: ChatRoom;
  /** 차단 완료 후 호출 (패널 닫기 + 대화방 나가기 등) */
  onBlocked: () => void;
}

/**
 * 실시간 통화가 있는 앱은 차단/신고 수단이 필수다 (App Store Guideline 1.2).
 * 서버에 차단/신고 API가 아직 없으므로:
 * - 차단: 로컬 차단 목록(blockList.ts)에 추가 — 이 기기에서는 다시 이 대화방에 들어갈 수 없음
 * - 신고: 이메일로 고객센터에 신고 내용 전송 (customer-center의 SUPPORT_EMAIL 재사용)
 */
export function OptionsDangerSection({ room, onBlocked }: OptionsDangerSectionProps) {
  const handleBlock = () => {
    Alert.alert(
      '차단하시겠습니까?',
      `${room.name}님을 차단하면 더 이상 대화를 주고받을 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            await blockRoom(room.id);
            onBlocked();
          },
        },
      ]
    );
  };

  const handleReport = async () => {
    const subject = encodeURIComponent('[Mirror Soul] 사용자 신고');
    const bodyTemplate = `아래 양식에 맞춰 신고 내용을 작성해 주시면 더욱 빠른 확인이 가능합니다.

---
■ 신고 대상: ${room.name} (대화방 ID: ${room.id})
■ 신고 사유:
(예: 부적절한 발언, 사기 의심, 불쾌한 대화 내용 등)
■ 상세 내용:
(여기에 자세한 신고 내용을 남겨주세요)
---

감사합니다.`;
    const body = encodeURIComponent(bodyTemplate);
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('메일 앱을 열 수 없습니다', `${SUPPORT_EMAIL} 으로 직접 신고해 주세요.`);
      }
    } catch (error) {
      logger.error('OptionsDangerSection: failed to open report email', error);
      Alert.alert('오류가 발생했습니다', `${SUPPORT_EMAIL} 으로 직접 신고해 주세요.`);
    }
  };

  return (
    <View style={[styles.menuSection, styles.dangerSection]}>
      <Text style={styles.sectionLabel}>DANGER ZONE</Text>

      {/* 대화 내용 삭제 */}
      <View style={styles.menuItemMargin}>
        <Pressable style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Feather name="trash-2" size={16} color={Colors.neutral.darkGray} />
            <Text style={styles.dangerItemText}>대화 내용 삭제</Text>
          </View>
        </Pressable>
      </View>

      {/* 신고하기 */}
      <View style={styles.menuItemMarginSm}>
        <Pressable style={styles.menuItem} onPress={handleReport}>
          <View style={styles.menuItemLeft}>
            <Feather name="flag" size={16} color={Colors.neutral.darkGray} />
            <Text style={styles.dangerItemText}>신고하기</Text>
          </View>
        </Pressable>
      </View>

      {/* 차단하기 */}
      <View style={styles.menuItemMarginSm}>
        <Pressable style={styles.menuItem} onPress={handleBlock}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="ban-outline" size={16} color={Colors.neutral.darkGray} />
            <Text style={styles.dangerItemText}>차단하기</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuSection: {
    alignSelf: 'stretch',
  },
  dangerSection: {
    marginTop: Spacing.xxxl,
  },
  sectionLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    lineHeight: 15,
    letterSpacing: 1.12,
    textTransform: 'uppercase',
    color: Colors.neutral.disabledText,
    paddingHorizontal: Spacing.sm,
  },
  menuItemMargin: {
    paddingTop: Spacing.md,
    alignSelf: 'stretch',
  },
  menuItemMarginSm: {
    paddingTop: Spacing.xs,
    alignSelf: 'stretch',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignSelf: 'stretch',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dangerItemText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: Colors.neutral.lightGray,
  },
});
