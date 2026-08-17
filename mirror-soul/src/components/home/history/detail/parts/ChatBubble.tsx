import EditPencilIcon from '@/assets/images/common/history/call_history/call_edit_pencil.svg';
import { Colors, FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { TalkLogResult } from '@/src/types/api/history';
import { toTimeLabel } from '@/src/utils/formatHistoryDate';
import ChatEditForm from './ChatEditForm';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ChatBubbleProps {
  message: TalkLogResult;
  partnerName: string;
  partnerProfileImageUrl?: string | null;
  /** 연속된 상대방 메시지에서 아바타를 반복 표시하지 않기 위한 플래그 */
  hideAvatar: boolean;
  /** 진입 stagger 애니메이션 딜레이(ms) */
  enterDelay: number;
  editingId: number | null;
  editText: string;
  isSaving?: boolean;
  onEditStart: (id: number, currentText: string) => void;
  onEditSave: (id: number) => void;
  onEditCancel: () => void;
  onEditTextChange: (text: string) => void;
}

/**
 * 단일 채팅 말풍선 컴포넌트 (SRP)
 * message-room의 MessageBubble.tsx와 동일한 시각 언어(그라디언트/그림자/아바타 그룹핑)를 따른다 —
 * 다만 이 화면은 실시간 채팅이 아니라 과거 통화 리뷰라 편집 인터랙션(연필 → 인라인 수정)은 유지한다.
 *
 * speaker(ME/MY_TWIN/PARTNER/PARTNER_TWIN) 4종은 "나(우측)/상대(좌측)" 2분법으로 축약해 표시한다
 * (4종 구분 UI는 이번 스코프 밖 — 후속 디자인 논의 필요).
 *
 * React.memo(커스텀 비교자)로 감싼다 — 부모(CallDetailBody)의 editText는 키 입력마다 바뀌는데,
 * 그 값이 실제로 필요한 건 지금 편집 중인 말풍선 하나뿐이다. 비교자 없이 그냥 넘기면 타이핑할
 * 때마다 화면에 보이는 말풍선 전체가 리렌더된다.
 */
function ChatBubble({
  message,
  partnerName,
  partnerProfileImageUrl,
  hideAvatar,
  enterDelay,
  editingId,
  editText,
  isSaving = false,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditTextChange,
}: ChatBubbleProps) {
  const { colors } = useThemeColors();
  const isMine = message.speaker === 'ME' || message.speaker === 'MY_TWIN';
  const isEditing = editingId === message.talkLogId;
  const timeLabel = toTimeLabel(message.startedAt);
  const accessibilityLabel = `${isMine ? '나' : partnerName}, ${timeLabel}, ${message.message}`;

  // 상대방 말풍선 (PARTNER / PARTNER_TWIN)
  if (!isMine) {
    return (
      <Animated.View
        entering={FadeInUp.delay(enterDelay).duration(300).springify()}
        style={styles.rowLeft}
        accessible
        accessibilityLabel={accessibilityLabel}
      >
        <View style={styles.avatarSlot}>
          {!hideAvatar &&
            (partnerProfileImageUrl ? (
              <Image source={{ uri: partnerProfileImageUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={Colors.gradient.avatarPlaceholder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitial}>{partnerName[0]}</Text>
              </LinearGradient>
            ))}
        </View>

        <View style={styles.receivedBubbleWrapper}>
          <View
            style={[
              styles.bubbleBase,
              styles.receivedBubble,
              { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
            ]}
          >
            <Text style={[styles.messageText, { color: colors.text.primary }]}>{message.message}</Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.text.muted }]}>{timeLabel}</Text>
        </View>
      </Animated.View>
    );
  }

  // 내 말풍선 (ME / MY_TWIN)
  return (
    <Animated.View
      entering={FadeInUp.delay(enterDelay).duration(300).springify()}
      style={styles.rowRight}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      {/* 왼쪽 메타 정보: [수정됨]이 [시간] 위에 오도록 세로 배치 */}
      <View style={styles.metaLeft}>
        {message.edited && <Text style={[styles.editedLabel, { color: colors.text.muted }]}>수정됨</Text>}
        <Text style={[styles.timestamp, { color: colors.text.muted }]}>{timeLabel}</Text>
      </View>

      {/* 말풍선 컨테이너 (flexShrink 적용으로 레이아웃 넘침 방지) */}
      <View style={styles.sentBubbleContainer}>
        <LinearGradient
          colors={Colors.gradient.twinCallButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubbleBase, styles.sentBubble]}
        >
          {isEditing ? (
            // 수정 모드: TextInput이 가용한 가로 공간을 모두 채우도록 flex 적용
            <View style={styles.editingContent}>
              <TextInput
                style={styles.textInput}
                value={editText}
                onChangeText={onEditTextChange}
                multiline
                autoFocus
                editable={!isSaving}
                maxLength={2000}
                placeholderTextColor={Colors.neutral.disabledText}
                accessibilityLabel="내 Twin 답변 수정"
                accessibilityHint="이 메시지의 텍스트를 수정합니다"
              />
              <ChatEditForm
                onSave={() => onEditSave(message.talkLogId)}
                onCancel={onEditCancel}
                disabled={isSaving}
              />
            </View>
          ) : (
            // 일반 모드
            <Text style={styles.sentMessageText}>{message.message}</Text>
          )}
        </LinearGradient>

        {/* 수정 버튼: 편집 가능한(내 Twin 답변) 말풍선에만 노출하며 우측 상단 오버랩 */}
        {!isEditing && message.editable && (
          <TouchableOpacity
            style={[styles.editButtonAbsolute, { backgroundColor: colors.background.card }]}
            onPress={() => onEditStart(message.talkLogId, message.message)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="메시지 수정"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <EditPencilIcon width={12} height={12} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

function arePropsEqual(prev: ChatBubbleProps, next: ChatBubbleProps): boolean {
  if (prev.message !== next.message) return false;
  if (prev.hideAvatar !== next.hideAvatar) return false;
  if (prev.enterDelay !== next.enterDelay) return false;
  if (prev.editingId !== next.editingId) return false;
  if (prev.isSaving !== next.isSaving) return false;
  // editText는 이 말풍선이 지금 편집 대상일 때만 비교한다 — 다른 말풍선에는 어차피 안 쓰이는 값이라
  // 매 키 입력마다 리렌더를 유발할 이유가 없다.
  const isBeingEdited = next.editingId === next.message.talkLogId;
  if (isBeingEdited && prev.editText !== next.editText) return false;
  return true;
}

export default memo(ChatBubble, arePropsEqual);

const styles = StyleSheet.create({
  rowLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: Spacing.sm,
    maxWidth: '85%',
    marginTop: Spacing.sm,
  },
  rowRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: Spacing.sm,
    maxWidth: '85%', // 기기 너비에 따른 동적 대응을 위한 퍼센트 너비
    marginTop: Spacing.sm,
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
  avatarInitial: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.xs,
    color: Colors.neutral.pureWhite,
  },
  receivedBubbleWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  metaLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: Spacing.xxs,
    minWidth: 40, // 메타 정보 공간 확보
  },
  sentBubbleContainer: {
    position: 'relative',
    flexShrink: 1, // 중요: 자식(말풍선)이 부모 너비를 넘지 않고 줄어들게 함 (잘림 방지)
  },
  bubbleBase: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 0.612,
    shadowColor: Colors.primary.soulBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  receivedBubble: {
    borderTopLeftRadius: Radii.bubble,
    borderTopRightRadius: Radii.lg,
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    flexShrink: 1,
  },
  sentBubble: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.bubble,
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    alignSelf: 'flex-start', // 텍스트 길이에 맞춰 너비 조절
  },
  editingContent: {
    alignSelf: 'stretch',
    minWidth: 120, // 입력 시 최소 공간 확보
  },
  messageText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
    letterSpacing: -0.15,
  },
  sentMessageText: {
    color: Colors.primary.soulBlack,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
    letterSpacing: -0.15,
  },
  textInput: {
    color: Colors.primary.soulBlack,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    lineHeight: 22,
    letterSpacing: -0.15,
    padding: Spacing.none,
    textAlignVertical: 'top',
    alignSelf: 'stretch',
  },
  editButtonAbsolute: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.full,
    borderWidth: 0.612,
    borderColor: Colors.glass.white30,
    zIndex: 10,
  },
  timestamp: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.regular,
    lineHeight: 14,
  },
  editedLabel: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.regular,
    lineHeight: 14,
  },
});
