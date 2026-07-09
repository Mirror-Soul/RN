import { SpeedOption } from '../../../store/useVoiceAudioStore';

export interface SpeedOptionConfig {
  value: SpeedOption;
  label: string;
}

/**
 * 속도 세그먼트 컨트롤 옵션 정의
 * 순서가 화면 표시 순서와 동일해야 합니다.
 */
export const SPEED_OPTIONS: SpeedOptionConfig[] = [
  { value: 'slow', label: '조금 천천히' },
  { value: 'normal', label: '보통' },
  { value: 'fast', label: '조금 빠르게' },
];

/** 세그먼트 컨트롤 내부 레이아웃 상수 */
export const SEGMENT_CONFIG = {
  containerHeight: 46,
  containerBorderRadius: 14,
  buttonBorderRadius: 10,
  innerPadding: 4.61, // CSS 명세: left/top: 4.61px
} as const;
