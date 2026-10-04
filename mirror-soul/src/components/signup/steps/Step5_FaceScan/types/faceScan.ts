export type ScanPhase = 'idle' | 'positioning' | 'countdown' | 'scanning' | 'finalizing' | 'completed';
export type FaceDirection = 'front' | 'left' | 'right';
export interface DirectionConfig {
  id: string;
  direction: FaceDirection;
  label: string;
  guideMessage: string;
  duration: number;
}
