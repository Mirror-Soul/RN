import apiClient from './apiClient';
import {
  EndCallRequest,
  EndCallResponse,
  InitiateCallRequest,
  InitiateCallResponse,
  InProgressResponse,
} from '../types/api/call';
import { logger } from '../utils/logger';

/**
 * 통화(Call) 도메인 API 서비스 (SoC)
 */

/** 클론에게 음성 통화 걸기 */
export const initiateCall = async (
  cloneUserUuid: string,
  data: InitiateCallRequest
): Promise<InitiateCallResponse> => {
  const url = `/calls/clones/${cloneUserUuid}`;
  logger.debug('initiateCall:', { url, data });
  try {
    const response = await apiClient.post<InitiateCallResponse>(url, data);
    logger.info('initiateCall SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('initiateCall ERROR:', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** 통화 연결 완료 처리 */
export const setCallInProgress = async (
  callId: number
): Promise<InProgressResponse> => {
  const url = `/calls/${callId}/in-progress`;
  logger.debug('setCallInProgress:', { callId });
  try {
    const response = await apiClient.patch<InProgressResponse>(url);
    logger.info('setCallInProgress SUCCESS');
    return response.data;
  } catch (error: unknown) {
    logger.error('setCallInProgress ERROR:', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** 통화 종료 */
export const endCall = async (
  callId: number,
  recordingUrl: string
): Promise<EndCallResponse> => {
  const url = `/calls/${callId}/end`;
  logger.debug('endCall:', { callId });
  const body: EndCallRequest = { recordingUrl };
  try {
    const response = await apiClient.post<EndCallResponse>(url, body);
    logger.info('endCall SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('endCall ERROR:', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};
