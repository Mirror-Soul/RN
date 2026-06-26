import { ApiResponse } from './common';

/**
 * 파일 도메인 API 타입 정의
 */

export type FileType = 'interviews' | 'face-videos' | 'job-certifications' | 'call-recordings';

// ─────────────────────────────────────────────
// POST /files/presigned-url
// ─────────────────────────────────────────────
export interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
  directory: FileType;
}

export interface PresignedUrlResult {
  presignedUrl: string;
  fileUrl: string;
  objectKey: string;
}
export type PresignedUrlResponse = ApiResponse<PresignedUrlResult>;
