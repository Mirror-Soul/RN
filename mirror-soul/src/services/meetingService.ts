import apiClient from './apiClient';
import {
  AcceptedMeetingRequestResponse,
  CreateMeetingRequestPayload,
  CreatedMeetingRequestResponse,
  MeetingRequestListResponse,
  RespondedMeetingRequestResponse,
} from '../types/api/meeting';
import { logger } from '../utils/logger';

/**
 * 만남 신청(Meeting) 도메인 API 서비스 (SoC)
 */

/** 받은 만남 신청 목록 조회 (PENDING만) */
export const getReceivedMeetingRequests = async (): Promise<MeetingRequestListResponse> => {
  logger.debug('getReceivedMeetingRequests');
  try {
    const response = await apiClient.get<MeetingRequestListResponse>('/match/meeting/requests');
    logger.info('getReceivedMeetingRequests SUCCESS:', { count: response.data.result.requests.length });
    return response.data;
  } catch (error: unknown) {
    logger.error('getReceivedMeetingRequests ERROR:', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/** 만남 신청 보내기 — videoCallId는 요청자 본인이 건 COMPLETED 통화여야 백엔드가 통과시킨다 */
export const createMeetingRequest = async (
  data: CreateMeetingRequestPayload
): Promise<CreatedMeetingRequestResponse> => {
  logger.debug('createMeetingRequest:', data);
  try {
    const response = await apiClient.post<CreatedMeetingRequestResponse>('/match/meeting/requests', data);
    logger.info('createMeetingRequest SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('createMeetingRequest ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 만남 신청 거절 */
export const rejectMeetingRequest = async (requestId: number): Promise<RespondedMeetingRequestResponse> => {
  logger.debug('rejectMeetingRequest:', { requestId });
  try {
    const response = await apiClient.post<RespondedMeetingRequestResponse>(
      `/match/meeting/requests/${requestId}/reject`
    );
    logger.info('rejectMeetingRequest SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('rejectMeetingRequest ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 만남 신청 수락 — 성공 시 백엔드가 채팅방을 자동 생성(또는 이미 있으면 기존 방을 그대로 반환)한다 */
export const acceptMeetingRequest = async (requestId: number): Promise<AcceptedMeetingRequestResponse> => {
  logger.debug('acceptMeetingRequest:', { requestId });
  try {
    const response = await apiClient.post<AcceptedMeetingRequestResponse>(
      `/match/meeting/requests/${requestId}/accept`
    );
    logger.info('acceptMeetingRequest SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('acceptMeetingRequest ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
