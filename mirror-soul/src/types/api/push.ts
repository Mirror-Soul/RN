import { ApiResponse } from './common';

/**
 * 푸시 알림 도메인 API 타입 정의
 * 백엔드 PushDeviceController(`/push/devices`) 기준
 */

export type PushDevicePlatform = 'IOS' | 'ANDROID';

// ─────────────────────────────────────────────
// PUT /push/devices
// ─────────────────────────────────────────────
export interface RegisterPushDeviceRequest {
  installationId: string;
  pushToken: string;
  platform: PushDevicePlatform;
}

export interface PushDeviceResult {
  installationId: string;
  platform: PushDevicePlatform;
  enabled: boolean;
  lastSeenAt: string;
}

export type RegisterPushDeviceResponse = ApiResponse<PushDeviceResult>;

// ─────────────────────────────────────────────
// DELETE /push/devices/{installation-id}
// ─────────────────────────────────────────────
export type UnregisterPushDeviceResponse = ApiResponse<void>;
