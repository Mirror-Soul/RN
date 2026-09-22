import apiClient from './apiClient';
import { MatchingStatusResponse, TwinListResponse, UpdateMatchingStatusRequest } from '../types/api/match';
import { logger } from '../utils/logger';

/**
 * 매칭(Match) 도메인 API 서비스 (SoC)
 */

/** 통화했던 Twin 목록 조회 — 최근 통화 순, 상대별 중복 없음 */
export const getTwins = async (): Promise<TwinListResponse> => {
  logger.debug('getTwins');
  try {
    const response = await apiClient.get<TwinListResponse>('/match/twins');
    logger.info('getTwins SUCCESS:', { count: response.data.result.twins.length });
    return response.data;
  } catch (error: unknown) {
    logger.error('getTwins ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 디지털 자아 매칭 상태 조회 */
export const getMatchingStatus = async (): Promise<MatchingStatusResponse> => {
  logger.debug('getMatchingStatus');
  try {
    const response = await apiClient.get<MatchingStatusResponse>('/match/status');
    logger.info('getMatchingStatus SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getMatchingStatus ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 디지털 자아 매칭 ON/OFF 변경 — OFF 시 다른 사용자의 추천에서 제외되고 새 통화가 차단됨 */
export const updateMatchingStatus = async (data: UpdateMatchingStatusRequest): Promise<MatchingStatusResponse> => {
  logger.info('updateMatchingStatus:', data);
  try {
    const response = await apiClient.patch<MatchingStatusResponse>('/match/status', data);
    logger.info('updateMatchingStatus SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('updateMatchingStatus ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
