import apiClient from './apiClient';
import { TwinListResponse } from '../types/api/match';
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
