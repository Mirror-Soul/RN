import { ApiResponse } from './common';

/**
 * 채팅(Chat) 도메인 API 타입 정의
 * 백엔드 ChatController(`/chat`) 기준
 */

export type ChatMessageType = 'TEXT';

export interface ChatPartner {
  userUuid: string;
  name: string;
  profileImageUrl: string;
  age: number | null;
  twinSimilarity: number | null;
  lastActiveAt: string | null;
}

export interface ChatMessage {
  messageId: number;
  chatRoomId: number;
  senderUserUuid: string;
  clientMessageId: string;
  messageType: ChatMessageType;
  content: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// GET /chat/rooms
// ─────────────────────────────────────────────
export interface ChatRoomSummary {
  chatRoomId: number;
  partner: ChatPartner;
  /** 아직 메시지가 없는 갓 생성된 방일 수 있어 null 가능. */
  lastMessage: ChatMessage | null;
  unreadCount: number;
  notificationEnabled: boolean;
  createdAt: string;
}

export interface ChatRoomListResult {
  totalCount: number;
  rooms: ChatRoomSummary[];
}

export type ChatRoomListResponse = ApiResponse<ChatRoomListResult>;

// ─────────────────────────────────────────────
// GET /chat/rooms/{room-id}/messages?beforeMessageId=&size=
// ─────────────────────────────────────────────
export interface GetMessagesParams {
  beforeMessageId?: number;
  size?: number;
}

export interface MessageListResult {
  messages: ChatMessage[];
  nextCursor: number | null;
  hasNext: boolean;
}

export type MessageListResponse = ApiResponse<MessageListResult>;

// ─────────────────────────────────────────────
// GET/PATCH /chat/rooms/{room-id}/notification
// ─────────────────────────────────────────────
export interface NotificationSettingResult {
  chatRoomId: number;
  enabled: boolean;
}

export type NotificationSettingResponse = ApiResponse<NotificationSettingResult>;

// ─────────────────────────────────────────────
// POST /chat/rooms/{room-id}/messages
// ─────────────────────────────────────────────
export interface SendMessagePayload {
  /** 재전송 시 서버가 같은 메시지로 인식해 중복 없이 기존 메시지를 그대로 반환한다(멱등). */
  clientMessageId: string;
  content: string;
}

export type SendMessageResponse = ApiResponse<ChatMessage>;

// ─────────────────────────────────────────────
// PATCH /chat/rooms/{room-id}/read
// ─────────────────────────────────────────────
export interface ReadMessagesResult {
  chatRoomId: number;
  lastReadMessageId: number;
  lastReadAt: string;
  updated: boolean;
}

export type ReadMessagesResponse = ApiResponse<ReadMessagesResult>;
