import apiClient from './apiClient';
import { RegionCoordinatesResponse, RegionSearchResponse } from '../types/api/region';
import { logger } from '../utils/logger';

/**
 * 지역(Region) 도메인 API 서비스 (SoC)
 */

/** 좌표 포함 전국 읍면동 목록 조회 — 앱에서 1회 캐싱해 재사용한다 */
export const getRegionCoordinates = async (): Promise<RegionCoordinatesResponse> => {
  logger.debug('getRegionCoordinates');
  try {
    const response = await apiClient.get<RegionCoordinatesResponse>('/regions/coordinates');
    logger.info('getRegionCoordinates SUCCESS:', { count: response.data.result.length });
    return response.data;
  } catch (error: unknown) {
    logger.error('getRegionCoordinates ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};

/** 읍면동/시군구 이름 검색 (최대 20건) */
export const searchRegions = async (keyword: string): Promise<RegionSearchResponse> => {
  logger.debug('searchRegions:', { keyword });
  try {
    const response = await apiClient.get<RegionSearchResponse>('/regions/search', {
      params: { keyword },
    });
    logger.info('searchRegions SUCCESS:', { count: response.data.result.length });
    return response.data;
  } catch (error: unknown) {
    logger.error('searchRegions ERROR:', { message: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
