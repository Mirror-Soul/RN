import apiClient from './apiClient';
import {
  RegisterPushDeviceRequest,
  RegisterPushDeviceResponse,
  UnregisterPushDeviceResponse,
} from '../types/api/push';
import { logger } from '../utils/logger';

/**
 * 푸시 알림 도메인 API 서비스 (SoC)
 */

/** 푸시 기기 등록 또는 토큰 갱신 */
export const registerPushDevice = async (
  data: RegisterPushDeviceRequest
): Promise<RegisterPushDeviceResponse> => {
  logger.debug('registerPushDevice:', { installationId: data.installationId, platform: data.platform });
  try {
    const response = await apiClient.put<RegisterPushDeviceResponse>('/push/devices', data);
    logger.info('registerPushDevice SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('registerPushDevice ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 푸시 기기 등록 해제 */
export const unregisterPushDevice = async (installationId: string): Promise<UnregisterPushDeviceResponse> => {
  logger.debug('unregisterPushDevice:', { installationId });
  try {
    const response = await apiClient.delete<UnregisterPushDeviceResponse>(`/push/devices/${installationId}`);
    logger.info('unregisterPushDevice SUCCESS');
    return response.data;
  } catch (error: unknown) {
    logger.error('unregisterPushDevice ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
