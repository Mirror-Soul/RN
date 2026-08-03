/**
 * 얼굴 데이터(표정/감정 학습) 캡처 모듈 전용 타입 정의
 */

/** 캡처 진행 단계 (VoiceUpdateStatus와 동일한 명명 규칙) */
export type FaceDataCapturePhase = 'idle' | 'recording' | 'processing' | 'done';

/** 캡처할 표정 종류 */
export type ExpressionId = 'neutral' | 'smile' | 'surprised' | 'sad' | 'angry';

/**
 * 표정 진행 방식
 * - auto-smile: MLKit의 smilingProbability로 실제 미소를 감지해서 자동 진행 (신뢰 가능한 유일한 신호)
 * - manual: MLKit에 해당 표정을 판별하는 신호가 없어, 얼굴이 화면에 있는 동안 사용자가
 *           직접 "표정 캡처 완료"를 눌러야 다음으로 진행 (blind 타이머보다 신뢰도 높음)
 */
export type ExpressionCaptureMode = 'auto-smile' | 'manual';

/** 표정별 프롬프트 설정 */
export interface ExpressionPrompt {
  id: ExpressionId;
  label: string;
  guideMessage: string;
  mode: ExpressionCaptureMode;
  /** auto-smile 모드에서 미소를 유지해야 하는 시간 (밀리초) */
  holdDurationMs: number;
}
