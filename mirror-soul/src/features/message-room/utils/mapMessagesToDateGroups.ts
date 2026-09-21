import { toRelativeDateLabel, toTimeLabel } from '@/src/utils/formatHistoryDate';
import { ChatMessage } from '@/src/types/api/chat';
import { MessageDateGroup, MessageItem } from '../types';

/**
 * 오래된순 ChatMessage[](API 원본)을 화면이 쓰는 MessageDateGroup[](뷰모델)로 변환한다.
 * "읽음" 표시는 내가 보낸 메시지 중 가장 최근 것에만 붙인다(대화 앱 관례 — 메시지마다 붙이지 않음).
 */
export function mapMessagesToDateGroups(
  messages: ChatMessage[],
  myUuid: string | null,
  lastReadMessageId: number | null
): MessageDateGroup[] {
  let lastSentMessageId: number | null = null;
  for (const message of messages) {
    if (message.senderUserUuid === myUuid) {
      lastSentMessageId = message.messageId;
    }
  }

  const groups: MessageDateGroup[] = [];
  for (const message of messages) {
    const isSent = message.senderUserUuid === myUuid;
    const item: MessageItem = {
      id: String(message.messageId),
      text: message.content,
      direction: isSent ? 'SENT' : 'RECEIVED',
      timestamp: toTimeLabel(message.createdAt),
      isReadByPartner:
        isSent &&
        message.messageId === lastSentMessageId &&
        lastReadMessageId !== null &&
        lastReadMessageId >= message.messageId,
    };

    const dateLabel = toRelativeDateLabel(message.createdAt.slice(0, 10));
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.date === dateLabel) {
      lastGroup.messages.push(item);
    } else {
      groups.push({ date: dateLabel, messages: [item] });
    }
  }

  return groups;
}
