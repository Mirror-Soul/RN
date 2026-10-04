import { DirectionConfig } from '../types/faceScan';

export const FACE_ANGLE_THRESHOLDS = { frontRange: 18, yawLeft: -20, yawRight: 20 } as const;

// 21초의 유효 촬영 + 3초 준비. 정면 구간을 충분히 확보한다.
export const SCAN_DIRECTIONS: DirectionConfig[] = [
  { id: 'relaxed', direction: 'front', label: '편안한 모습', guideMessage: '정면을 보고 편하게 있어주세요.', duration: 4000 },
  { id: 'smile', direction: 'front', label: '가벼운 미소', guideMessage: '평소처럼 살짝 웃어주세요.', duration: 3000 },
  { id: 'speaking', direction: 'front', label: '말하는 모습', guideMessage: '“안녕하세요. 만나서 반가워요.”\n편하게 말해주세요. 소리는 저장하지 않아요.', duration: 7000 },
  { id: 'left', direction: 'left', label: '왼쪽 모습', guideMessage: '얼굴을 왼쪽으로 살짝 돌려주세요.', duration: 2000 },
  { id: 'right', direction: 'right', label: '오른쪽 모습', guideMessage: '얼굴을 오른쪽으로 살짝 돌려주세요.', duration: 2000 },
  { id: 'finish', direction: 'front', label: '다시 정면', guideMessage: '정면으로 돌아와 편하게 있어주세요.', duration: 3000 },
];
export const MAX_CAPTURE_DURATION = 60000;
export const FRAME_FRESHNESS_MS = 700;
