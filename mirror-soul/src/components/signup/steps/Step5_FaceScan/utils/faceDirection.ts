import { FaceDirection } from '../types/faceScan';
import { FACE_ANGLE_THRESHOLDS } from '../constants/faceScanConfig';

/**
 * 얼굴 방향 판별 유틸 함수
 * yaw/pitch 각도로부터 현재 얼굴이 바라보는 방향을 분류합니다.
 *
 * @param yaw - 좌우 회전 각도
 * @param pitch - 상하 회전 각도
 * @returns 판별된 얼굴 방향 또는 null
 */
export function classifyDirection(yaw: number, pitch: number): FaceDirection | null {
  const t = FACE_ANGLE_THRESHOLDS;

  // 정면 판별
  if (Math.abs(yaw) < t.frontRange && Math.abs(pitch) < t.frontRange) {
    return 'front';
  }

  // 좌/우 판별 (미러링 대응: yaw < 0 이 오른쪽, yaw > 0 이 왼쪽인 경우 보정)
  if (yaw < t.yawLeft) return 'right';
  if (yaw > t.yawRight) return 'left';

  // 상/하 판별
  if (pitch < t.pitchUp) return 'down';
  if (pitch > t.pitchDown) return 'up';

  return null;
}
