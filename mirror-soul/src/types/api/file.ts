import { ApiResponse } from './common';

/**
 * 파일 도메인 API 타입 정의
 */

export type FileType = 'interviews' | 'face-videos' | 'job-certifications';

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

// ─────────────────────────────────────────────
// POST /files/upload-complete
// ─────────────────────────────────────────────
export interface CompleteFileUploadRequest {
  objectKey: string;
  fileType: 'INTERVIEW_AUDIO' | 'FACE_VIDEO' | 'JOB_CERTIFICATION';
}

export interface CompleteFileUploadResult {
  fileType: string;
  objectKey: string;
  fileUrl: string;
  uploaded: boolean;
}

export type CompleteFileUploadResponse = ApiResponse<CompleteFileUploadResult>;
