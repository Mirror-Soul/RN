import apiClient from './apiClient';
import {
  AccountInfoResponse,
  AlarmSettingRequest,
  AlarmSettingResponse,
  AudioSettingsRequest,
  AudioSettingsResponse,
  BuyTimeRequest,
  DeleteAccountResponse,
  ModifyNicknameRequest,
  ModifyNicknameResponse,
  MyProfileResponse,
  TimeStatusResponse,
} from '../types/api/profile';
import { logger } from '../utils/logger';

/**
 * 마이페이지(Profile) 도메인 API 서비스 (SoC)
 */

/** 마이페이지 진입 - 이름/이메일 조회 */
export const getMyProfile = async (): Promise<MyProfileResponse> => {
  logger.debug('getMyProfile');
  try {
    const response = await apiClient.get<MyProfileResponse>('/my-page');
    logger.info('getMyProfile SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getMyProfile ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 나의 남은 대화 시간 조회 */
export const getMyTime = async (): Promise<TimeStatusResponse> => {
  logger.debug('getMyTime');
  try {
    const response = await apiClient.get<TimeStatusResponse>('/my-page/buy-time');
    logger.info('getMyTime SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getMyTime ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 대화 시간 채우기 (초 단위) */
export const buyTime = async (seconds: number): Promise<TimeStatusResponse> => {
  logger.debug('buyTime:', { seconds });
  const body: BuyTimeRequest = { buyTime: seconds };
  try {
    const response = await apiClient.post<TimeStatusResponse>('/my-page/buy-time', body);
    logger.info('buyTime SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('buyTime ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 음성 및 오디오 설정 조회 */
export const getAudioSettings = async (): Promise<AudioSettingsResponse> => {
  logger.debug('getAudioSettings');
  try {
    const response = await apiClient.get<AudioSettingsResponse>('/my-page/audio-settings');
    logger.info('getAudioSettings SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getAudioSettings ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 음성 및 오디오 설정 수정 */
export const updateAudioSettings = async (data: AudioSettingsRequest): Promise<AudioSettingsResponse> => {
  logger.debug('updateAudioSettings:', data);
  try {
    const response = await apiClient.patch<AudioSettingsResponse>('/my-page/audio-settings', data);
    logger.info('updateAudioSettings SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('updateAudioSettings ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 알림 설정 조회 */
export const getAlarmSetting = async (): Promise<AlarmSettingResponse> => {
  logger.debug('getAlarmSetting');
  try {
    const response = await apiClient.get<AlarmSettingResponse>('/my-page/alarm');
    logger.info('getAlarmSetting SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getAlarmSetting ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 알림 설정 수정 */
export const modifyAlarmSetting = async (data: AlarmSettingRequest): Promise<AlarmSettingResponse> => {
  logger.debug('modifyAlarmSetting:', data);
  try {
    const response = await apiClient.patch<AlarmSettingResponse>('/my-page/alarm', data);
    logger.info('modifyAlarmSetting SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('modifyAlarmSetting ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 계정관리 조회 (닉네임) */
export const getAccountInfo = async (): Promise<AccountInfoResponse> => {
  logger.debug('getAccountInfo');
  try {
    const response = await apiClient.get<AccountInfoResponse>('/my-page/account');
    logger.info('getAccountInfo SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getAccountInfo ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 닉네임 변경 */
export const modifyNickname = async (nickname: string): Promise<ModifyNicknameResponse> => {
  logger.debug('modifyNickname:', { nickname });
  const body: ModifyNicknameRequest = { nickname };
  try {
    const response = await apiClient.post<ModifyNicknameResponse>('/my-page/account', body);
    logger.info('modifyNickname SUCCESS');
    return response.data;
  } catch (error: unknown) {
    logger.error('modifyNickname ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 회원 탈퇴 (Soft Delete) */
export const deleteAccount = async (): Promise<DeleteAccountResponse> => {
  logger.debug('deleteAccount');
  try {
    const response = await apiClient.delete<DeleteAccountResponse>('/my-page');
    logger.info('deleteAccount SUCCESS');
    return response.data;
  } catch (error: unknown) {
    logger.error('deleteAccount ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
