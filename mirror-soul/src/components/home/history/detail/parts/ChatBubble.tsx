import EditPencilIcon from '@/assets/images/common/history/call_history/call_edit_pencil.svg';
import {Colors, Radii, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import type { TalkLogResult } from '@/src/types/api/history';
import { toTimeLabel } from '@/src/utils/formatHistoryDate';
import ChatEditForm from './ChatEditForm';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ChatBubbleProps {
  message: TalkLogResult;
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
 * 레이아웃 넘침 방지(flexShrink) 및 반응형 메타 정보 배치를 지원합니다.
 *
 * speaker(ME/MY_TWIN/PARTNER/PARTNER_TWIN) 4종은 "나(우측)/상대(좌측)" 2분법으로 축약해 표시한다
 * (4종 구분 UI는 이번 스코프 밖 — 후속 디자인 논의 필요).
 */
export default function ChatBubble({
  message,
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

  // 상대방 말풍선 (PARTNER / PARTNER_TWIN)
  if (!isMine) {
    return (
      <View style={styles.rowLeft}>
        <View style={[styles.bubbleBase, styles.receivedBubble]}>
          <Text style={styles.messageText}>{message.message}</Text>
        </View>
        <Text style={styles.timestamp}>{timeLabel}</Text>
      </View>
    );
  }

  // 내 말풍선 (ME / MY_TWIN)
  return (
    <View style={styles.rowRight}>
      {/* 왼쪽 메타 정보: [수정됨]이 [시간] 위에 오도록 세로 배치 */}
      <View style={styles.metaLeft}>
        {message.edited && <Text style={styles.editedLabel}>수정됨</Text>}
        <Text style={styles.timestamp}>{timeLabel}</Text>
      </View>

      {/* 말풍선 컨테이너 (flexShrink 적용으로 레이아웃 넘침 방지) */}
      <View style={styles.sentBubbleContainer}>
        <LinearGradient
          colors={[Colors.glass.purple20, Colors.glass.pink20]}
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
                placeholderTextColor={Colors.neutral.darkGray}
              />
              <ChatEditForm
                onSave={() => onEditSave(message.talkLogId)}
                onCancel={onEditCancel}
                disabled={isSaving}
              />
            </View>
          ) : (
            // 일반 모드
            <Text style={styles.messageText}>{message.message}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  rowLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: Spacing.sm,
    maxWidth: '85%',
  },
  rowRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: Spacing.sm,
    maxWidth: '85%', // 기기 너비에 따른 동적 대응을 위한 퍼센트 너비
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
  },
  receivedBubble: {
    borderTopLeftRadius: Radii.bubble,
    borderTopRightRadius: Radii.lg,
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white10,
    flexShrink: 1,
  },
  sentBubble: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.bubble,
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    borderColor: Colors.glass.purple30,
    alignSelf: 'flex-start', // 텍스트 길이에 맞춰 너비 조절
  },
  editingContent: {
    alignSelf: 'stretch',
    minWidth: 120, // 입력 시 최소 공간 확보
  },
  messageText: {
    color: Colors.neutral.pureWhite,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
    letterSpacing: -0.15,
  },
  textInput: {
    color: Colors.neutral.pureWhite,
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
    borderColor: Colors.glass.purple50,
    zIndex: 10,
  },
  timestamp: {
    color: Colors.neutral.darkGray,
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.regular,
    lineHeight: 14,
  },
  editedLabel: {
    color: Colors.neutral.darkGray,
    fontFamily: FontFamily.sans,
    fontSize: 11,
    fontWeight: FontWeight.regular,
    lineHeight: 14,
  },
});
