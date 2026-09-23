import apiClient from './apiClient';
import {
  HomeResponse,
  RecommendationDetailResponse,
  RecommendationsResponse,
  SwipeResponse,
  UpdatePreferredRegionRequest,
  UpdatePreferredRegionResponse,
} from '../types/api/home';
import { logger } from '../utils/logger';

/**
 * 홈(Home) 도메인 API 서비스 (SoC)
 */

/** 홈 화면 조회 - 잔여 대화 시간과 현재 탐색 지역(앵커+반경) */
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

/** 탐색 지역(동 앵커+반경) 설정 */
export const updatePreferredRegion = async (
  data: UpdatePreferredRegionRequest
): Promise<UpdatePreferredRegionResponse> => {
  logger.debug('updatePreferredRegion:', data);
  try {
    const response = await apiClient.put<UpdatePreferredRegionResponse>('/home/preferred-region', data);
    logger.info('updatePreferredRegion SUCCESS:', response.data);
    return response.data;
  } catch (error: unknown) {
    logger.error('updatePreferredRegion ERROR:', { message: error instanceof Error ? error.message : String(error) });
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
