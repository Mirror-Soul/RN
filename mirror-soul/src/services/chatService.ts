import apiClient from './apiClient';
import {
  ChatRoomListResponse,
  GetMessagesParams,
  MessageListResponse,
  NotificationSettingResponse,
  ReadMessagesResponse,
  SendMessagePayload,
  SendMessageResponse,
} from '../types/api/chat';
import { logger } from '../utils/logger';

/**
 * 채팅(Chat) 도메인 API 서비스 (SoC)
 */

/** 내 채팅방 목록 조회 */
export const getChatRooms = async (): Promise<ChatRoomListResponse> => {
  logger.debug('getChatRooms');
  try {
    const response = await apiClient.get<ChatRoomListResponse>('/chat/rooms');
    logger.info('getChatRooms SUCCESS:', { count: response.data.result.rooms.length });
    return response.data;
  } catch (error: unknown) {
    logger.error('getChatRooms ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 채팅 메시지 내역 조회 (beforeMessageId 커서 기반 페이지네이션) */
export const getChatMessages = async (
  roomId: number,
  params: GetMessagesParams = {}
): Promise<MessageListResponse> => {
  logger.debug('getChatMessages:', { roomId, params });
  try {
    const response = await apiClient.get<MessageListResponse>(`/chat/rooms/${roomId}/messages`, { params });
    logger.info('getChatMessages SUCCESS:', { count: response.data.result.messages.length });
    return response.data;
  } catch (error: unknown) {
    logger.error('getChatMessages ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 채팅방 알림 설정 조회 */
export const getNotificationSetting = async (roomId: number): Promise<NotificationSettingResponse> => {
  logger.debug('getNotificationSetting:', { roomId });
  try {
    const response = await apiClient.get<NotificationSettingResponse>(`/chat/rooms/${roomId}/notification`);
    logger.info('getNotificationSetting SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getNotificationSetting ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 채팅방 알림 설정 변경 */
export const updateNotificationSetting = async (
  roomId: number,
  enabled: boolean
): Promise<NotificationSettingResponse> => {
  logger.debug('updateNotificationSetting:', { roomId, enabled });
  try {
    const response = await apiClient.patch<NotificationSettingResponse>(`/chat/rooms/${roomId}/notification`, {
      enabled,
    });
    logger.info('updateNotificationSetting SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('updateNotificationSetting ERROR:', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** 텍스트 메시지 전송 — clientMessageId가 같으면 서버가 중복 없이 기존 메시지를 그대로 반환한다(재전송 안전) */
export const sendChatMessage = async (
  roomId: number,
  data: SendMessagePayload
): Promise<SendMessageResponse> => {
  logger.debug('sendChatMessage:', { roomId, data });
  try {
    const response = await apiClient.post<SendMessageResponse>(`/chat/rooms/${roomId}/messages`, data);
    logger.info('sendChatMessage SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('sendChatMessage ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 채팅 메시지 읽음 처리 */
export const readChatMessages = async (roomId: number, lastReadMessageId: number): Promise<ReadMessagesResponse> => {
  logger.debug('readChatMessages:', { roomId, lastReadMessageId });
  try {
    const response = await apiClient.patch<ReadMessagesResponse>(`/chat/rooms/${roomId}/read`, {
      lastReadMessageId,
    });
    logger.info('readChatMessages SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('readChatMessages ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
