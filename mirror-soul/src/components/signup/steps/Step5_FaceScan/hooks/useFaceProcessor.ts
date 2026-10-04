import { useEffect, useMemo, useRef } from 'react';
import { runAtTargetFps, useFrameProcessor } from 'react-native-vision-camera';
import { Face, useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import type { PreviewSize } from '../utils/captureQuality';

interface Props {
  onFaceDetected: (faces: Face[]) => void;
  isActive: boolean;
  previewSize: PreviewSize;
}

export function useFaceProcessor({ onFaceDetected, isActive, previewSize }: Props) {
  const callback = useRef(onFaceDetected);
  useEffect(() => { callback.current = onFaceDetected; }, [onFaceDetected]);
  // 옵션 객체가 바뀔 때 플러그인이 생성되므로 크기 변경 시에만 다시 만든다.
  const options = useMemo(() => ({
    performanceMode: 'fast' as const, classificationMode: 'none' as const,
    contourMode: 'none' as const, autoMode: true, cameraFacing: 'front' as const,
    windowWidth: previewSize.width, windowHeight: previewSize.height,
  }), [previewSize.width, previewSize.height]);
  const { detectFaces } = useFaceDetector(options);
  const runOnJs = useMemo(() => Worklets.createRunOnJS((faces: Face[]) => callback.current(faces)), []);
  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    if (!isActive || previewSize.width <= 0 || previewSize.height <= 0) return;
    runAtTargetFps(5, () => {
      'worklet';
      runOnJs(detectFaces(frame));
    });
  }, [isActive, previewSize.width, previewSize.height, detectFaces, runOnJs]);
  return { frameProcessor };
}
