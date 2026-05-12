import {
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  BasicProfileRequest,
  BasicProfileResponse,
} from '@/src/types/api/auth';
import apiClient from './apiClient';

/**
 * 인증 도메인 API 서비스 (SoC: 인증 비즈니스 로직 분리)
 * 추후 프로필, 인터뷰 등 서비스 추가 시 같은 패턴으로 확장.
 */

/** 이메일 인증 코드 발송 */
export const sendVerificationCode = async (
  data: SendCodeRequest
): Promise<SendCodeResponse> => {
  const response = await apiClient.post<SendCodeResponse>('/join/send-code', data);
  return response.data;
};

/** 이메일 인증 코드 확인 */
export const verifyCode = async (
  data: VerifyCodeRequest
): Promise<VerifyCodeResponse> => {
  const response = await apiClient.post<VerifyCodeResponse>('/join/verify-code', data);
  return response.data;
};

/** 기본 프로필 생성 (계정 생성) */
export const createBasicProfile = async (
  data: BasicProfileRequest
): Promise<BasicProfileResponse> => {
  const response = await apiClient.post<BasicProfileResponse>('/join/basic-profile', data);
  return response.data;
};
