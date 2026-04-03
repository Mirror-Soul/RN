import { DirectionConfig } from '../types/faceScan';

/**
 * 얼굴 방향을 판별하기 위한 Euler Angle 임계값 (단위: 도)
 *
 * - yawAngle: 좌우 회전 (음수 = 왼쪽, 양수 = 오른쪽)
 * - pitchAngle: 상하 회전 (음수 = 위, 양수 = 아래)
 */
export const FACE_ANGLE_THRESHOLDS = {
  /** 정면 인정 범위: |yaw| < frontRange && |pitch| < frontRange */
  frontRange: 10,
  /** yaw < yawLeft → 왼쪽을 보고 있음 */
  yawLeft: -30,
  /** yaw > yawRight → 오른쪽을 보고 있음 */
  yawRight: 30,
  /** pitch < pitchUp → 위를 보고 있음 */
  pitchUp: -20,
  /** pitch > pitchDown → 아래를 보고 있음 */
  pitchDown: 20,
} as const;

/**
 * 스캔 시 안내할 방향 목록 (순서대로 진행)
 */
export const SCAN_DIRECTIONS: DirectionConfig[] = [
  { direction: 'front', label: '정면', guideMessage: '정면을 바라봐 주세요' },
  { direction: 'left', label: '왼쪽', guideMessage: '왼쪽을 바라봐 주세요' },
  { direction: 'right', label: '오른쪽', guideMessage: '오른쪽을 바라봐 주세요' },
  { direction: 'up', label: '위', guideMessage: '위를 바라봐 주세요' },
  { direction: 'down', label: '아래', guideMessage: '아래를 바라봐 주세요' },
];

/**
 * 각 방향을 유지해야 하는 시간 (밀리초)
 * 이 시간 동안 얼굴이 해당 방향을 향하고 있으면 완료로 인정
 */
export const DIRECTION_HOLD_DURATION = 1500;
