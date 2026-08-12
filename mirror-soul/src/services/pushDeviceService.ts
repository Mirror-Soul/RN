import apiClient from './apiClient';
import {
  RegisterPushDeviceRequest,
  RegisterPushDeviceResponse,
  UnregisterPushDeviceResponse,
} from '../types/api/push';
import { getOrCreateInstallationId } from '../utils/installationId';
import { logger } from '../utils/logger';

/**
 * 푸시 알림 기기 등록(Push Device) 도메인 API 서비스 (SoC)
 */

/** 푸시 기기 등록 또는 토큰 갱신 — 호출 시점의 로그인 유저에게 소유권이 재할당된다 */
export const registerPushDevice = async (
  data: RegisterPushDeviceRequest
): Promise<RegisterPushDeviceResponse> => {
  logger.debug('registerPushDevice:', { installationId: data.installationId, platform: data.platform });
  try {
    const response = await apiClient.put<RegisterPushDeviceResponse>('/push/devices', data);
    logger.info('registerPushDevice SUCCESS');
    return response.data;
  } catch (error: unknown) {
    logger.error('registerPushDevice ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 푸시 기기 등록 해제 — 로그아웃 시 반드시 액세스 토큰이 살아있는 시점에 호출해야 함 */
export const unregisterPushDevice = async (
  installationId: string
): Promise<UnregisterPushDeviceResponse> => {
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

/**
 * 로그아웃 시 호출 — authService.performLogout() 맨 앞(액세스 토큰이 아직
 * 살아있는 시점)에서 호출해야 한다. 순서를 지키지 않으면 401로 실패하는데,
 * 로그아웃 자체를 막으면 안 되므로 실패는 로그만 남기고 삼킨다.
 */
export const unregisterCurrentPushDevice = async (): Promise<void> => {
  try {
    const installationId = await getOrCreateInstallationId();
    await unregisterPushDevice(installationId);
  } catch (error: unknown) {
    logger.warn('unregisterCurrentPushDevice: failed, proceeding with logout anyway', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
