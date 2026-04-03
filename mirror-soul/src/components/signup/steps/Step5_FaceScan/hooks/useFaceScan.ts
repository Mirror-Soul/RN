import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera as VisionCamera,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { Alert } from 'react-native';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import type { Face } from 'react-native-vision-camera-face-detector';
import { ScanPhase, FaceDirection } from '../types/faceScan';
import {
  SCAN_DIRECTIONS,
  DIRECTION_HOLD_DURATION,
  FACE_ANGLE_THRESHOLDS,
} from '../constants/faceScanConfig';

/**
 * 얼굴 방향 판별 유틸 함수
 * yaw/pitch 각도로부터 현재 얼굴이 바라보는 방향을 분류합니다.
 */
function classifyDirection(yaw: number, pitch: number): FaceDirection | null {
  const t = FACE_ANGLE_THRESHOLDS;

  if (Math.abs(yaw) < t.frontRange && Math.abs(pitch) < t.frontRange) {
    return 'front';
  }
  if (yaw < t.yawLeft) return 'left';
  if (yaw > t.yawRight) return 'right';
  if (pitch < t.pitchUp) return 'up';
  if (pitch > t.pitchDown) return 'down';

  return null;
}

/**
 * Face Scan 상태 머신 훅
 *
 * 카메라 권한, 영상 녹화, 얼굴 방향 감지, 자동 전환 로직을 통합 관리합니다.
 */
export function useFaceScan() {
  const cameraRef = useRef<VisionCamera>(null);
  const device = useCameraDevice('front');
  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    classificationMode: 'none',
    contourMode: 'none',
  });

  // --- 상태 ---
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(0);
  const [completedDirections, setCompletedDirections] = useState<boolean[]>(
    SCAN_DIRECTIONS.map(() => false)
  );
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isDirectionMatching, setIsDirectionMatching] = useState(false);

  // --- Refs (타이머 및 홀드 상태 관리) ---
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);

  // --- 권한 요청 ---
  const requestPermission = useCallback(async () => {
    const status = await VisionCamera.requestCameraPermission();
    const granted = status === 'granted';
    setHasPermission(granted);
    return granted;
  }, []);

  // --- 스캔 시작 ---
  const startScan = useCallback(async () => {
    try {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          '카메라 권한 필요',
          '설정에서 카메라 권한을 허용해주세요.'
        );
        return;
      }

      // 상태 초기화
      setPhase('scanning');
      setCurrentDirectionIndex(0);
      setCompletedDirections(SCAN_DIRECTIONS.map(() => false));
      setVideoUri(null);
      setIsDirectionMatching(false);
      isHoldingRef.current = false;

      // 영상 녹화 시작
      cameraRef.current?.startRecording({
        onRecordingFinished: (video) => {
          setVideoUri(video.path);
          // TODO: 서버 전송 로직 구현 필요 (예: await uploadVideo(video.path))
        },
        onRecordingError: (error) => {
          console.error('녹화 오류:', error);
          Alert.alert('녹화 오류', '영상 녹화 중 문제가 발생했습니다.');
          setPhase('idle');
        },
      });
    } catch (error) {
      console.error('스캔 시작 오류:', error);
      Alert.alert('오류 발생', '스캔을 시작하는 중 문제가 발생했습니다.');
      setPhase('idle');
    }
  }, [requestPermission]);

  // --- 얼굴 감지 콜백 (JS 스레드 실행) ---
  const handleFaceDetection = useCallback(
    (faces: Face[]) => {
      if (phase !== 'scanning' || faces.length === 0) {
        // 얼굴 미감지 또는 스캔 중 아님 → 홀드 리셋
        setIsDirectionMatching(false);
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        isHoldingRef.current = false;
        return;
      }

      const face = faces[0];
      const detected = classifyDirection(face.yawAngle, face.pitchAngle);
      const targetDirection = SCAN_DIRECTIONS[currentDirectionIndex]?.direction;

      // [DEBUG] 실시간 로그 출력
      console.log(`[Face Scan] Yaw: ${face.yawAngle.toFixed(2)}, Pitch: ${face.pitchAngle.toFixed(2)} => 감지방향: ${detected || '없음'} | 목표: ${targetDirection}`);

      if (detected === targetDirection) {
        // 올바른 방향 감지 → UI 피드백
        setIsDirectionMatching(true);

        if (!isHoldingRef.current) {
          // 홀드 타이머 시작
          isHoldingRef.current = true;
          holdTimerRef.current = setTimeout(() => {
            // 방향 유지 완료!
            setCompletedDirections((prev) => {
              const next = [...prev];
              next[currentDirectionIndex] = true;
              return next;
            });

            const nextIndex = currentDirectionIndex + 1;
            if (nextIndex >= SCAN_DIRECTIONS.length) {
              // 전체 방향 완료 → 녹화 중단
              cameraRef.current?.stopRecording();
              setPhase('completed');
            } else {
              // 다음 방향으로 이동
              setCurrentDirectionIndex(nextIndex);
            }

            isHoldingRef.current = false;
            setIsDirectionMatching(false);
          }, DIRECTION_HOLD_DURATION);
        }
      } else {
        // 잘못된 방향 → 홀드 리셋
        setIsDirectionMatching(false);
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        isHoldingRef.current = false;
      }
    },
    [phase, currentDirectionIndex]
  );

  // JS 스레드 브릿징 콜백
  const runOnJs = Worklets.createRunOnJS(handleFaceDetection);

  // --- Frame Processor ---
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // JS 런타임으로 전달하기 위해 stringify
    const faces = JSON.stringify(detectFaces(frame));
    runOnJs(JSON.parse(faces));
  }, [detectFaces, runOnJs]);

  // --- 클린업 ---
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  // --- 파생 값 ---
  const currentDirection =
    SCAN_DIRECTIONS[currentDirectionIndex] ?? SCAN_DIRECTIONS[0];
  const totalDirections = SCAN_DIRECTIONS.length;

  return {
    cameraRef,
    device,
    phase,
    currentDirection,
    currentDirectionIndex,
    totalDirections,
    completedDirections,
    videoUri,
    hasPermission,
    isDirectionMatching,
    startScan,
    frameProcessor,
  };
}
