import apiClient from './apiClient';
import { BlockResponse } from '../types/api/block';
import { logger } from '../utils/logger';

/**
 * 사용자 차단(Block) 도메인 API 서비스 (SoC)
 */

/** 사용자 차단 — 차단하면 백엔드가 둘 사이 PENDING 만남 신청도 자동으로 거절 처리한다 */
export const blockUser = async (targetUserUuid: string): Promise<BlockResponse> => {
  logger.debug('blockUser:', { targetUserUuid });
  try {
    const response = await apiClient.post<BlockResponse>(`/blocks/${targetUserUuid}`);
    logger.info('blockUser SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('blockUser ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 사용자 차단 해제 */
export const unblockUser = async (targetUserUuid: string): Promise<BlockResponse> => {
  logger.debug('unblockUser:', { targetUserUuid });
  try {
    const response = await apiClient.delete<BlockResponse>(`/blocks/${targetUserUuid}`);
    logger.info('unblockUser SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('unblockUser ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
