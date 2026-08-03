import { logger } from '@/src/utils/logger';
import { useEffect, useMemo, useRef } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Face, useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';

interface UseFaceDataProcessorProps {
  /** 얼굴 감지 시 실행할 JS 핸들러 */
  onFaceDetected: (faces: Face[]) => void;
  /** 현재 캡처가 활성화된 상태인지 여부 */
  isActive: boolean;
}

/**
 * 얼굴 데이터 캡처 전용 프레임 프로세서 엔진 훅
 *
 * Step5_FaceScan의 useFaceProcessor와 구조는 동일하지만, classificationMode를 'all'로 켜서
 * smilingProbability(미소 감지)를 함께 받는다. 신원확인용 useFaceProcessor는 각도 판정만
 * 필요해 classificationMode가 꺼져 있어 그대로 재사용할 수 없어 별도로 둔다.
 */
export function useFaceDataProcessor({ onFaceDetected, isActive }: UseFaceDataProcessorProps) {
  const onFaceDetectedRef = useRef(onFaceDetected);

  useEffect(() => {
    onFaceDetectedRef.current = onFaceDetected;
  }, [onFaceDetected]);

  useEffect(() => {
    if (isActive) {
      logger.debug('Face Data Detection Engine Activated');
    } else {
      logger.debug('Face Data Detection Engine Deactivated');
    }
  }, [isActive]);

  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    classificationMode: 'all',
    contourMode: 'none',
  });

  const runOnJs = useMemo(
    () =>
      Worklets.createRunOnJS((faces: Face[]) => {
        onFaceDetectedRef.current(faces);
      }),
    []
  );

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!isActive) return;

      const faces = detectFaces(frame);
      runOnJs(faces);
    },
    [isActive, detectFaces, runOnJs]
  );

  return { frameProcessor };
}
