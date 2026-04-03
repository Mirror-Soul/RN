import { useRef, useEffect, useMemo } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { useFaceDetector, Face } from 'react-native-vision-camera-face-detector';

interface UseFaceProcessorProps {
  /** 얼굴 감지 시 실행할 JS 핸들러 */
  onFaceDetected: (faces: Face[]) => void;
  /** 현재 스캔이 활성화된 상태인지 여부 */
  isActive: boolean;
}

/**
 * 전용 프레임 프로세서 엔진 훅
 *
 * [핵심 포인트 - Ref Pattern]
 * JS의 handleFaceDetection이 상태 변화(phase, index 등)로 인해 바뀔 때마다
 * runOnJs를 재성능하거나 프레임 프로세서를 재생성하지 않도록 보장합니다.
 * 이를 통해 'Stale Closure' 문제를 해결하고 카메라 무거운 작업을 안정적으로 수행합니다.
 */
export function useFaceProcessor({ onFaceDetected, isActive }: UseFaceProcessorProps) {
  // 최신 핸들러를 참조하기 위한 Ref
  const onFaceDetectedRef = useRef(onFaceDetected);

  // 핸들러가 바뀔 때마다 Ref 업데이트 (재렌더링 시점 동기화)
  useEffect(() => {
    onFaceDetectedRef.current = onFaceDetected;
  }, [onFaceDetected]);

  // 얼굴 감지 엔진 초기화
  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    classificationMode: 'none',
    contourMode: 'none',
  });

  // [중요] JS 스레드 브릿칭 함수는 한 번만 생성
  const runOnJs = useMemo(
    () =>
      Worklets.createRunOnJS((faces: Face[]) => {
        // 항상 최신 Ref의 핸들러를 호출
        onFaceDetectedRef.current(faces);
      }),
    []
  );

  // 프레임 처리 엔진 (Stable)
  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!isActive) return;

      const faces = detectFaces(frame);
      // JS 스레드로 얼굴 데이터 전송
      runOnJs(faces);
    },
    [isActive, detectFaces, runOnJs]
  );

  return { frameProcessor };
}
