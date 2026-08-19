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
 * 로그아웃 공통 절차: 서버 세션 정리 + 푸시 기기 해제(둘 다 실패해도 무시) → 로컬 토큰/스토어
 * 정리 → react-query 캐시 초기화. 화면들은 이 함수 호출 후 자체적으로 네비게이션
 * (router.replace 등)만 처리하면 된다.
 *
 * 푸시 기기 해제는 인증 토큰이 있어야 하는 API라 로컬 스토어를 지우기 전(try 블록)에
 * 처리해야 한다 — useAuthStore.getState().logout() 이후로 미루면 apiClient가 더 이상
 * Authorization 헤더를 붙이지 못해 항상 실패한다.
 */
export const performLogout = async (): Promise<void> => {
  try {
    const installationId = await getOrCreateInstallationId();
    const [logoutResult, unregisterResult] = await Promise.allSettled([
      logout(),
      unregisterPushDevice(installationId),
    ]);
    if (logoutResult.status === 'rejected') {
      logger.warn('authService: /auth/logout failed, proceeding with local logout', logoutResult.reason);
    }
    if (unregisterResult.status === 'rejected') {
      logger.warn('authService: push device unregister failed, proceeding with local logout', unregisterResult.reason);
    }
  } catch (error) {
    logger.warn('authService: logout 사전 정리 중 오류, 로컬 로그아웃은 계속 진행', error);
  } finally {
    await useAuthStore.getState().logout();
    queryClient.clear();
  }
};
