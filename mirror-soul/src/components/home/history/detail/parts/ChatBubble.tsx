import EditPencilIcon from '@/assets/images/common/history/call_history/call_edit_pencil.svg';
import { Colors, Radii } from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChatMessage } from '../../parts/HistoryCallCard';
import ChatEditForm from './ChatEditForm';

interface ChatBubbleProps {
  message: ChatMessage;
  editingId: string | null;
  editText: string;
  onEditStart: (id: string, currentText: string) => void;
  onEditSave: (id: string) => void;
  onEditCancel: () => void;
  onEditTextChange: (text: string) => void;
}

/**
 * 단일 채팅 말풍선 컴포넌트 (SRP)
 * direction에 따라 상대방(RECEIVED) / 나(SENT) 스타일을 분기합니다.
 */
export default function ChatBubble({
  message,
  editingId,
  editText,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditTextChange,
}: ChatBubbleProps) {
  const isSent = message.direction === 'SENT';
  const isEditing = editingId === message.id;

  // 수정 모드일 때
  if (isEditing) {
    return (
      <View style={styles.rowRight}>
        <ChatEditForm
          value={editText}
          onChangeText={onEditTextChange}
          onSave={() => onEditSave(message.id)}
          onCancel={onEditCancel}
        />
      </View>
    );
  }

  // 상대방 말풍선 (RECEIVED)
  if (!isSent) {
    return (
      <View style={styles.rowLeft}>
        <View style={[styles.bubbleBase, styles.receivedBubble]}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
      </View>
    );
  }

  // 내 말풍선 (SENT)
  return (
    <View style={styles.rowRight}>
      <LinearGradient
        colors={[Colors.glass.purple20, Colors.glass.pink20]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.bubbleBase, styles.sentBubble]}
      >
        <Text style={styles.messageText}>{message.text}</Text>

        {/* 편집 버튼 & 수정됨 레이블 */}
        <View style={styles.editRow}>
          {message.isEdited && (
            <Text style={styles.editedLabel}>수정됨</Text>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEditStart(message.id, message.text)}
            activeOpacity={0.7}
            accessibilityLabel="메시지 수정"
          >
            <EditPencilIcon width={12} height={12} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <Text style={[styles.timestamp, styles.timestampRight]}>{message.timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    gap: 4,
    maxWidth: '75%',
  },
  rowRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: '75%',
  },
  bubbleBase: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderWidth: 0.612,
  },
  receivedBubble: {
    borderTopLeftRadius: Radii.bubble,   // 6 — 발신 기원 표시
    borderTopRightRadius: Radii.lg,      // 16
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    borderColor: Colors.glass.white10,
    backgroundColor: Colors.glass.white10,
  },
  sentBubble: {
    borderTopLeftRadius: Radii.lg,      // 16
    borderTopRightRadius: Radii.bubble, // 6 — 발신 기원 표시
    borderBottomRightRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
    borderColor: Colors.glass.purple30,
  },
  messageText: {
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.15,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  editedLabel: {
    color: Colors.neutral.darkGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  editButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.full,
    borderWidth: 0.612,
    borderColor: Colors.glass.purple50,
    backgroundColor: Colors.glass.purple30,
  },
  timestamp: {
    color: Colors.neutral.darkGray,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  timestampRight: {
    textAlign: 'right',
  },
});
