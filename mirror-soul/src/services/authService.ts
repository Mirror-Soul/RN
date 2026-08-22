import {
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  BasicProfileRequest,
  BasicProfileResponse,
} from '@/src/types/api/auth';
import apiClient from './apiClient';
import { queryClient } from './queryClient';
import { unregisterPushDevice } from './pushService';
import { useAuthStore } from '../store/useAuthStore';
import { getOrCreateInstallationId } from '../utils/installationIdStorage';
import { logger } from '../utils/logger';

/**
 * 인증 도메인 API 서비스 (SoC: 인증 비즈니스 로직 분리)
 */

export const sendVerificationCode = async (data: SendCodeRequest): Promise<SendCodeResponse> => {
  logger.debug('authService: Sending verification code');
  const response = await apiClient.post<SendCodeResponse>('/join/send-code', data);
  return response.data;
};

export const verifyCode = async (data: VerifyCodeRequest): Promise<VerifyCodeResponse> => {
  logger.debug('authService: Verifying code');
  const response = await apiClient.post<VerifyCodeResponse>('/join/verify-code', data);
  return response.data;
};

export const createBasicProfile = async (data: BasicProfileRequest): Promise<BasicProfileResponse> => {
  logger.info('authService: Creating basic profile (Account creation)');
  const response = await apiClient.post<BasicProfileResponse>('/join/basic-profile', data);
  return response.data;
};

// ─────────────────────────────────────────────
// 로그인 / 인증 토큰 관리
// ─────────────────────────────────────────────

export interface LoginResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
    userUuid: string;
    userStatus: string; 
  };
  error?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  logger.info('authService: Attempting login');
  const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  logger.info('authService: Attempting logout');
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

/**
 * 로그아웃 공통 절차: 푸시 기기 해제 → 서버 세션 정리(둘 다 실패해도 무시) → 로컬 토큰/스토어
 * 정리 → react-query 캐시 초기화. 화면들은 이 함수 호출 후 자체적으로 네비게이션
 * (router.replace 등)만 처리하면 된다.
 *
 * 푸시 기기 해제와 /auth/logout을 병렬로 보내지 않고 반드시 이 순서로 직렬 실행한다 —
 * 둘 다 인증 토큰이 필요한 API인데, 서버가 /auth/logout을 먼저 처리해 토큰을 무효화하면
 * 뒤따르는 기기 해제 요청이 인증 실패로 무시될 수 있다(로그아웃한 사용자의 기기에 알림 등록이
 * 그대로 남는 결과). 같은 이유로 둘 다 useAuthStore.getState().logout() 이전(로컬 토큰이
 * 아직 살아있을 때)에 끝내야 한다.
 */
export const performLogout = async (): Promise<void> => {
  try {
    const installationId = await getOrCreateInstallationId();
    try {
      await unregisterPushDevice(installationId);
    } catch (error) {
      logger.warn('authService: push device unregister failed, proceeding with logout', error);
    }
    await logout();
  } catch (error) {
    logger.warn('authService: logout 사전 정리 중 오류, 로컬 로그아웃은 계속 진행', error);
  } finally {
    await useAuthStore.getState().logout();
    queryClient.clear();
  }
};
