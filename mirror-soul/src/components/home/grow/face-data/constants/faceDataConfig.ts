import { ExpressionPrompt } from '../types/faceData';

/**
 * 표정 캡처 시 안내할 프롬프트 목록 (순서대로 진행)
 * 기본 5종 — 회원가입 얼굴 스캔의 5방향과 동일한 리듬으로 설계.
 *
 * '미소'만 MLKit smilingProbability로 실제 감지가 가능해 auto-smile 모드를 쓰고,
 * 나머지는 감지 신호가 없어 얼굴이 화면에 있을 때만 사용자가 직접 확인하는 manual 모드를 쓴다.
 */
export const EXPRESSION_PROMPTS: ExpressionPrompt[] = [
  { id: 'neutral', label: '무표정', guideMessage: '편안하게, 무표정을 지어주세요', mode: 'manual', holdDurationMs: 1200 },
  { id: 'smile', label: '미소', guideMessage: '자연스럽게 미소지어 주세요', mode: 'auto-smile', holdDurationMs: 1200 },
  { id: 'surprised', label: '놀람', guideMessage: '깜짝 놀란 표정을 지어주세요', mode: 'manual', holdDurationMs: 1200 },
  { id: 'sad', label: '슬픔', guideMessage: '슬프거나 시무룩한 표정을 지어주세요', mode: 'manual', holdDurationMs: 1200 },
  { id: 'angry', label: '화남', guideMessage: '화난 표정을 지어주세요', mode: 'manual', holdDurationMs: 1200 },
];

/** smilingProbability가 이 값 이상이면 '미소'로 인정 */
export const SMILE_PROBABILITY_THRESHOLD = 0.6;
