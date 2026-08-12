import { logger } from '@/src/utils/logger';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Camera as VisionCamera } from 'react-native-vision-camera';
import { Face } from 'react-native-vision-camera-face-detector';
import { EXPRESSION_PROMPTS, SMILE_PROBABILITY_THRESHOLD } from '../constants/faceDataConfig';
import { FaceDataCapturePhase } from '../types/faceData';

/**
 * 얼굴 데이터(표정) 캡처 상태 컨트롤러 훅
 *
 * 순수 타이머 기반 자동진행 대신, 프롬프트마다 실제 신호로 진행 여부를 판단한다:
 * - 얼굴이 화면에 없으면 어떤 프롬프트도 진행되지 않는다 (빈 화면이 '캡처'로 잡히는 것 방지).
 * - '미소' 프롬프트는 MLKit smilingProbability가 임계값 이상으로 유지되면 자동 진행.
 * - 나머지 프롬프트는 감지 신호가 없어, 얼굴이 있는 동안 사용자가 직접 확인 버튼을 눌러야 진행.
 * 실제 표정의 정확도 분석 자체는 업로드 후 AI 서버가 담당한다.
 */
export function useFaceDataCapture() {
  const cameraRef = useRef<VisionCamera>(null);

  const [phase, setPhase] = useState<FaceDataCapturePhase>('idle');
  const [promptIndex, setPromptIndex] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);

  const phaseRef = useRef<FaceDataCapturePhase>('idle');
  const promptIndexRef = useRef(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);

  const startCapture = useCallback(async () => {
    try {
      const status = await VisionCamera.requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('카메라 권한 필요', '설정에서 카메라 권한을 허용해주세요.');
        return;
      }

      setPhase('recording'); phaseRef.current = 'recording';
      setPromptIndex(0); promptIndexRef.current = 0;
      setVideoUri(null);
      setIsCameraReady(false);
      setIsFaceDetected(false);
      setIsSmiling(false);

      logger.debug('Face Data Capture Started');
    } catch (error) {
      logger.error('Face Data Capture Start Error:', error);
      Alert.alert('오류 발생', '촬영을 시작하는 중 문제가 발생했습니다.');
      setPhase('idle'); phaseRef.current = 'idle';
    }
  }, []);

  const onCameraInitialized = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  // --- 카메라 마운트 및 초기화 완료 후 녹화 시작 ---
  useEffect(() => {
    if (phase === 'recording' && isCameraReady && cameraRef.current && !videoUri) {
      try {
        logger.debug('Starting Face Data Recording...');
        cameraRef.current.startRecording({
          onRecordingFinished: (video) => {
            logger.info('Face Data Recording Finished:', video.path);
            setVideoUri(video.path);
            setPhase('processing'); phaseRef.current = 'processing';
          },
          onRecordingError: (error) => {
            logger.error('Face Data Recording Error:', error);
            Alert.alert('녹화 오류', '영상 녹화 중 문제가 발생했습니다.');
            setPhase('idle'); phaseRef.current = 'idle';
          },
        });
      } catch (err) {
        logger.error('Face Data Recording Start Exception:', err);
      }
    }
  }, [phase, isCameraReady, videoUri]);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    isHoldingRef.current = false;
  }, []);

  const advancePrompt = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    clearHoldTimer();
    setIsSmiling(false);

    const nextIndex = promptIndexRef.current + 1;
    if (nextIndex >= EXPRESSION_PROMPTS.length) {
      cameraRef.current?.stopRecording();
    } else {
      setPromptIndex(nextIndex); promptIndexRef.current = nextIndex;
    }
  }, [clearHoldTimer]);

  // --- 프레임 프로세서 콜백: 얼굴 존재 여부 + (미소 프롬프트일 때) 미소 강도 판정 ---
  const handleFaceDetection = useCallback(
    (faces: Face[]) => {
      if (phaseRef.current !== 'recording') {
        setIsFaceDetected(false);
        setIsSmiling(false);
        clearHoldTimer();
        return;
      }

      const detected = faces.length > 0;
      setIsFaceDetected(detected);

      const currentPromptConfig = EXPRESSION_PROMPTS[promptIndexRef.current];
      if (!currentPromptConfig || currentPromptConfig.mode !== 'auto-smile') {
        setIsSmiling(false);
        return;
      }

      const smilingProbability = detected ? (faces[0].smilingProbability ?? 0) : 0;
      const smiling = smilingProbability >= SMILE_PROBABILITY_THRESHOLD;
      setIsSmiling(smiling);

      if (smiling) {
        if (!isHoldingRef.current) {
          isHoldingRef.current = true;
          holdTimerRef.current = setTimeout(() => {
            advancePrompt();
          }, currentPromptConfig.holdDurationMs);
        }
      } else {
        clearHoldTimer();
      }
    },
    [advancePrompt, clearHoldTimer]
  );

  /** manual 모드 프롬프트에서 사용자가 직접 "표정 캡처 완료"를 눌렀을 때 호출 */
  const confirmCurrentPrompt = useCallback(() => {
    if (phaseRef.current !== 'recording') return;
    const currentPromptConfig = EXPRESSION_PROMPTS[promptIndexRef.current];
    if (!currentPromptConfig || currentPromptConfig.mode !== 'manual') return;
    if (!isFaceDetected) return; // 얼굴이 없으면 진행 불가 (안전장치)

    advancePrompt();
  }, [isFaceDetected, advancePrompt]);

  // --- 업로드 처리 (mock) ---
  // TODO: API 연동 시 실제 presigned-url 업로드 + /evolve/face 저장으로 교체.
  // 지금은 UI 흐름 확인용으로 짧은 지연 후 완료 처리만 한다.
  useEffect(() => {
    if (phase !== 'processing') return;
    const timer = setTimeout(() => {
      setPhase('done'); phaseRef.current = 'done';
    }, 1800);
    return () => clearTimeout(timer);
  }, [phase]);

  const reset = useCallback(() => {
    setPhase('idle'); phaseRef.current = 'idle';
    setPromptIndex(0); promptIndexRef.current = 0;
    setVideoUri(null);
    setIsCameraReady(false);
    setIsFaceDetected(false);
    setIsSmiling(false);
    clearHoldTimer();
  }, [clearHoldTimer]);

  // --- 언마운트 클린업 ---
  useEffect(() => {
    return () => {
      clearHoldTimer();
      try {
        if (cameraRef.current) {
          cameraRef.current.stopRecording();
        }
      } catch (error) {
        console.error('클린업 중 녹화 중단 에러 (무시됨):', error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPrompt = EXPRESSION_PROMPTS[promptIndex] ?? EXPRESSION_PROMPTS[0];

  return {
    cameraRef,
    phase,
    currentPrompt,
    promptIndex,
    totalPrompts: EXPRESSION_PROMPTS.length,
    isFaceDetected,
    isSmiling,
    startCapture,
    onCameraInitialized,
    handleFaceDetection,
    confirmCurrentPrompt,
    videoUri,
    reset,
  };
}
