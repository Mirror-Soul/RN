import apiClient from './apiClient';
import {
  HomeResponse,
  PreferredRegionsResponse,
  RecommendationDetailResponse,
  RecommendationsResponse,
  SigunguOptionsResponse,
  SwipeResponse,
  UpdatePreferredRegionsRequest,
} from '../types/api/home';
import { logger } from '../utils/logger';

/**
 * 홈(Home) 도메인 API 서비스 (SoC)
 */

/** 홈 화면 조회 - 잔여 대화 시간과 현재 선호 지역 */
export const getHome = async (): Promise<HomeResponse> => {
  logger.debug('getHome');
  try {
    const response = await apiClient.get<HomeResponse>('/home');
    logger.info('getHome SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getHome ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 선호 지역 설정 (1~3개) */
export const updatePreferredRegions = async (
  data: UpdatePreferredRegionsRequest
): Promise<PreferredRegionsResponse> => {
  logger.debug('updatePreferredRegions:', data);
  try {
    const response = await apiClient.put<PreferredRegionsResponse>('/home/preferred-regions', data);
    logger.info('updatePreferredRegions SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('updatePreferredRegions ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 선호 지역 선택지 조회 */
export const getPreferredRegionOptions = async (): Promise<SigunguOptionsResponse> => {
  logger.debug('getPreferredRegionOptions');
  try {
    const response = await apiClient.get<SigunguOptionsResponse>('/home/preferred-regions/options');
    logger.info('getPreferredRegionOptions SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getPreferredRegionOptions ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 발견 탭 추천 목록 조회 (오프셋 페이지네이션) */
export const getRecommendations = async (page: number, size: number): Promise<RecommendationsResponse> => {
  logger.debug('getRecommendations:', { page, size });
  try {
    const response = await apiClient.get<RecommendationsResponse>('/home/recommend', {
      params: { page, size },
    });
    logger.info('getRecommendations SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getRecommendations ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 추천 상대 상세 조회 */
export const getRecommendationDetail = async (targetUserUuid: string): Promise<RecommendationDetailResponse> => {
  logger.debug('getRecommendationDetail:', { targetUserUuid });
  try {
    const response = await apiClient.get<RecommendationDetailResponse>(`/home/recommendations/${targetUserUuid}`);
    logger.info('getRecommendationDetail SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('getRecommendationDetail ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 추천 상대 패스(스와이프) 기록 */
export const swipeRecommendation = async (targetUserUuid: string): Promise<SwipeResponse> => {
  logger.debug('swipeRecommendation:', { targetUserUuid });
  try {
    const response = await apiClient.post<SwipeResponse>(`/home/recommendations/${targetUserUuid}/swipe`);
    logger.info('swipeRecommendation SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('swipeRecommendation ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
