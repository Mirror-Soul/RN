import apiClient from './apiClient';
import {
  CallHistoryListResponse,
  HistoryType,
  TalkLogListResponse,
  TalkLogResponse,
  UpdateTalkLogRequest,
  WeeklySummaryResponse,
} from '../types/api/history';
import { logger } from '../utils/logger';

/**
 * 통화 기록(History) 도메인 API 서비스 (SoC)
 */

/** 최근 7일 통화 내역 조회 (방향 필터) */
export const getCallHistory = async (
  type: HistoryType = 'ALL'
): Promise<CallHistoryListResponse> => {
  logger.debug('getCallHistory:', { type });
  try {
    const response = await apiClient.get<CallHistoryListResponse>('/history/calls', {
      params: { type },
    });
    logger.info('getCallHistory SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getCallHistory ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 주간 통화 통계 조회 */
export const getWeeklySummary = async (): Promise<WeeklySummaryResponse> => {
  logger.debug('getWeeklySummary');
  try {
    const response = await apiClient.get<WeeklySummaryResponse>('/history/weekly-summary');
    logger.info('getWeeklySummary SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getWeeklySummary ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 통화 대화 내역(트랜스크립트) 조회 */
export const getTalkLogs = async (callId: number): Promise<TalkLogListResponse> => {
  const url = `/history/calls/${callId}/talk-logs`;
  logger.debug('getTalkLogs:', { callId });
  try {
    const response = await apiClient.get<TalkLogListResponse>(url);
    logger.info('getTalkLogs SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getTalkLogs ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 대화내역 수정 (내 Twin 답변만 수정 가능) */
export const updateTalkLog = async (
  callId: number,
  talkLogId: number,
  message: string
): Promise<TalkLogResponse> => {
  const url = `/history/calls/${callId}/talk-logs/${talkLogId}`;
  logger.debug('updateTalkLog:', { callId, talkLogId });
  const body: UpdateTalkLogRequest = { message };
  try {
    const response = await apiClient.patch<TalkLogResponse>(url, body);
    logger.info('updateTalkLog SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('updateTalkLog ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
