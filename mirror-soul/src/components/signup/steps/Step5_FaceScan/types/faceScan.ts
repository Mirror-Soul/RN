/**
 * Face Scan 모듈 전용 타입 정의
 */

/** 스캔 진행 단계 */
export type ScanPhase = 'idle' | 'scanning' | 'completed';

/** 사용자에게 요청할 얼굴 방향 */
export type FaceDirection = 'front' | 'left' | 'right' | 'up' | 'down';

/** 방향별 설정 인터페이스 */
export interface DirectionConfig {
  direction: FaceDirection;
  label: string;
  guideMessage: string;
}
