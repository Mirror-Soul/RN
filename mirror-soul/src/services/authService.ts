import {
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  BasicProfileRequest,
  BasicProfileResponse,
} from '@/src/types/api/auth';
import apiClient from './apiClient';
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
