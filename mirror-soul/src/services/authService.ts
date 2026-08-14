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
import { unregisterCurrentPushDevice } from './pushDeviceService';
import { useAuthStore } from '../store/useAuthStore';
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
 * 로그아웃 공통 절차: 푸시 기기 등록 해제 → 서버 세션 정리(실패해도 무시) →
 * 로컬 토큰/스토어 정리 → react-query 캐시 초기화.
 * 화면들은 이 함수 호출 후 자체적으로 네비게이션(router.replace 등)만 처리하면 된다.
 *
 * 푸시 기기 해제가 반드시 맨 앞이어야 하는 이유: DELETE /push/devices는 인증이
 * 필요한 API라, useAuthStore.getState().logout()으로 액세스 토큰을 지운 뒤에
 * 호출하면 401로 조용히 실패한다.
 */
export const performLogout = async (): Promise<void> => {
  await unregisterCurrentPushDevice();

  try {
    await logout();
  } catch (error) {
    logger.warn('authService: /auth/logout failed, proceeding with local logout', error);
  } finally {
    await useAuthStore.getState().logout();
    queryClient.clear();
  }
};
