/**
 * 채팅 WebSocket(`/ws/chat`) 실시간 이벤트 타입 정의
 *
 * 백엔드 ChatWebSocketEventDTO 기준. /ws/chat은 서버→클라이언트 단방향 푸시 전용이라
 * (핸들러가 클라이언트가 보내는 메시지를 처리하지 않음) signaling.ts와 달리 클라이언트→서버
 * 방향 타입은 없다. 발신자 본인은 findRealtimeRecipientUuids()가 제외하므로 이 이벤트를
 * 받지 못한다 — 자신이 보낸 메시지는 REST 응답으로 반영해야 한다.
 */

import { ChatMessage } from './api/chat';

export type ChatRealtimeEventType = 'MESSAGE_CREATED' | 'MESSAGE_READ';

/** MESSAGE_CREATED의 data — 전송된 메시지 그대로(ChatMessage) */
export type MessageCreatedData = ChatMessage;

/** MESSAGE_READ의 data — lastReadMessageId가 실제로 전진했을 때만 발행된다(중복 읽음 처리 시 미발행) */
export interface MessageReadData {
  readerUserUuid: string;
  lastReadMessageId: number;
  readAt: string;
}

export type ChatRealtimeData = MessageCreatedData | MessageReadData;

/** WebSocket 메시지 공통 래퍼 */
export interface ChatRealtimeEvent {
  type: ChatRealtimeEventType;
  chatRoomId: number;
  occurredAt: string;
  data: ChatRealtimeData;
}
