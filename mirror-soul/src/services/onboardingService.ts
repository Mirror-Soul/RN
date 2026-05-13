import {
  CheckNicknameRequest,
  CheckNicknameResponse,
  GetEupmyeondongRequest,
  GetEupmyeondongResponse,
  GetSidoResponse,
  GetSigunguRequest,
  GetSigunguResponse,
  JobEnum,
  SaveProfileRequest,
  SaveProfileResponse,
  SavePersonalityRequest,
  SavePersonalityResponse,
} from '../types/api/onboarding';
import apiClient from './apiClient';

/**
 * 온보딩 도메인 API 서비스 (SoC: 온보딩 비즈니스 로직 분리)
 */

/** 닉네임 중복 확인 */
export const checkNicknameDuplicate = async (
  data: CheckNicknameRequest
): Promise<CheckNicknameResponse> => {
  const response = await apiClient.post<CheckNicknameResponse>(
    '/onboarding/profile/check-dup-nickname',
    data
  );
  return response.data;
};

/** 지역 조회 - 시도 */
export const getSidoList = async (): Promise<GetSidoResponse> => {
  const response = await apiClient.get<GetSidoResponse>('/onboarding/regions/sido');
  return response.data;
};

/** 지역 조회 - 시군구 */
export const getSigunguList = async (
  params: GetSigunguRequest
): Promise<GetSigunguResponse> => {
  const response = await apiClient.get<GetSigunguResponse>('/onboarding/regions/sigungu', {
    params,
  });
  return response.data;
};

/** 지역 조회 - 읍면동 */
export const getEupmyeondongList = async (
  params: GetEupmyeondongRequest
): Promise<GetEupmyeondongResponse> => {
  const response = await apiClient.get<GetEupmyeondongResponse>(
    '/onboarding/regions/eupmyeondong',
    { params }
  );
  return response.data;
};

/** 프로필 설정 (최종 저장) */
export const saveProfile = async (
  userUuid: string,
  job: JobEnum,
  data: SaveProfileRequest
): Promise<SaveProfileResponse> => {
  const response = await apiClient.post<SaveProfileResponse>(
    `/onboarding/profile/${userUuid}`,
    data,
    {
      params: { job },
    }
  );
  return response.data;
};

/** 성격 유형 설정 (저장) */
export const savePersonality = async (
  userUuid: string,
  data: SavePersonalityRequest
): Promise<SavePersonalityResponse> => {
  const response = await apiClient.put<SavePersonalityResponse>(
    `/onboarding/personality/${userUuid}`,
    data
  );
  return response.data;
};
