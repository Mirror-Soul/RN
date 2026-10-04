import { FaceDirection } from '../types/faceScan';
import { FACE_ANGLE_THRESHOLDS } from '../constants/faceScanConfig';

export function classifyDirection(yaw: number, pitch: number): FaceDirection | null {
  const t = FACE_ANGLE_THRESHOLDS;
  if (!Number.isFinite(yaw) || !Number.isFinite(pitch) || Math.abs(pitch) > 20 || Math.abs(yaw) > 50) return null;
  if (Math.abs(yaw) < t.frontRange && Math.abs(pitch) < t.frontRange) return 'front';
  // 기존 전면 카메라의 미러링 규약을 유지한다.
  if (yaw < t.yawLeft) return 'right';
  if (yaw > t.yawRight) return 'left';
  return null;
}
