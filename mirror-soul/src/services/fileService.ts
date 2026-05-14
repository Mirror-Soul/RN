import apiClient from './apiClient';
import {
  PresignedUrlRequest,
  PresignedUrlResponse,
} from '../types/api/file';

/**
 * 파일 도메인 API 서비스 (SoC: 파일 업로드 관련 로직 분리)
 */

/** Presigned URL 발급 */
export const getPresignedUrl = async (
  data: PresignedUrlRequest
): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post<PresignedUrlResponse>('/files/presigned-url', data);
  return response.data;
};
