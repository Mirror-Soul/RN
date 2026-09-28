import React from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useBlockUserMutation } from '@/src/features/chat/hooks/useBlockUserMutation';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
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
 * - 차단: 실제 POST /blocks/{uuid} 호출(blockService.ts). 성공하면 백엔드 쿼리 자체가 두 사람의
 *   채팅방을 앞으로 제외하므로(useBlockUserMutation.ts 참고) 별도 로컬 숨김 목록이 필요 없다.
 * - 신고: 서버에 신고 도메인 자체가 없어 이메일로 고객센터에 전송(customer-center의
 *   SUPPORT_EMAIL 재사용) — 이건 확정된 방향이라 API가 생겨도 안 바뀐다.
 */
export function OptionsDangerSection({ room, onBlocked }: OptionsDangerSectionProps) {
  const blockMutation = useBlockUserMutation();
  const { colors } = useThemeColors();

  const handleBlock = () => {
    Alert.alert(
      '차단하시겠습니까?',
      `${room.partner.name}님을 차단하면 더 이상 대화를 주고받을 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: () => {
            blockMutation.mutate(room.partner.userUuid, {
              onSuccess: onBlocked,
              onError: (error) => Alert.alert('차단 실패', getErrorDisplayMessage(error, '차단하지 못했습니다.')),
            });
          },
        },
      ]
    );
  };

  const handleReport = async () => {
    const subject = encodeURIComponent('[Mirror Soul] 사용자 신고');
    const bodyTemplate = `아래 양식에 맞춰 신고 내용을 작성해 주시면 더욱 빠른 확인이 가능합니다.

---
■ 신고 대상: ${room.partner.name} (대화방 ID: ${room.chatRoomId})
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
      <Text style={[styles.sectionLabel, { color: colors.text.muted }]}>안전 관리</Text>

      <View style={[styles.actionCard, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}>
        <Pressable
          style={styles.menuItem}
          onPress={() => void handleReport()}
          accessibilityRole="button"
          accessibilityLabel="이메일로 신고하기"
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: Colors.glass.white10 }]}>
              <Feather name="flag" size={16} color={colors.text.secondary} />
            </View>
            <View style={styles.copyContainer}>
              <Text style={[styles.itemTitle, { color: colors.text.primary }]}>이메일로 신고하기</Text>
              <Text style={[styles.itemDescription, { color: colors.text.secondary }]}>고객센터에서 신고 내용을 확인해요.</Text>
            </View>
          </View>
        </Pressable>

        <View style={[styles.itemDivider, { backgroundColor: colors.border.primary }]} />
        <Pressable
          style={styles.menuItem}
          onPress={handleBlock}
          disabled={blockMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={`${room.partner.name} 차단하기`}
          accessibilityState={{ disabled: blockMutation.isPending, busy: blockMutation.isPending }}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(220, 38, 38, 0.10)' }]}>
              {blockMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.state.danger} />
              ) : (
                <Ionicons name="ban-outline" size={17} color={colors.state.danger} />
              )}
            </View>
            <View style={styles.copyContainer}>
              <Text style={[styles.itemTitle, { color: colors.state.danger }]}>차단하기</Text>
              <Text style={[styles.itemDescription, { color: colors.text.secondary }]}>차단하면 이 대화방을 다시 찾을 수 없어요.</Text>
            </View>
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
    marginTop: Spacing.xxl,
  },
  sectionLabel: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.xs,
  },
  actionCard: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg + 34 + Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignSelf: 'stretch',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyContainer: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  itemDescription: {
    marginTop: Spacing.xxs,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
});
