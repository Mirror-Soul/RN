import { ChatRoomSummary } from '@/src/types/api/chat';

export type MessageDirection = 'SENT' | 'RECEIVED';

export interface MessageItem {
  id: string;
  text: string;
  direction: MessageDirection;
  timestamp: string; // 'HH:MM' 형식
  /** 내가 보낸 마지막 메시지에만(mapMessagesToDateGroups 참고) 실시간 읽음 여부를 표시한다. */
  isReadByPartner?: boolean;
}

export interface MessageDateGroup {
  date: string; // '오늘', '어제', 'N월 N일' 등
  messages: MessageItem[];
}

/**
 * 메시지방(채팅방) 메타데이터 — 백엔드 `GET /chat/rooms`의 RoomDTO(ChatRoomSummary)를 그대로 쓴다.
 * 메시지 본문(dateGroups)은 별도 페이지네이션 API(`GET .../messages`)로 조회하므로 여기 포함되지
 * 않는다 — useChatMessagesQuery + mapMessagesToDateGroups가 이 형태로 변환해서 채운다.
 */
export type ChatRoom = ChatRoomSummary;

export * from './list';
