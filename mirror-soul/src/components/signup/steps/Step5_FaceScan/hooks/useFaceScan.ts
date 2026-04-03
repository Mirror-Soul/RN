import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera as VisionCamera } from 'react-native-vision-camera';
import { Alert } from 'react-native';
import { Face } from 'react-native-vision-camera-face-detector';
import { ScanPhase } from '../types/faceScan';
import {
  SCAN_DIRECTIONS,
  DIRECTION_HOLD_DURATION,
} from '../constants/faceScanConfig';
import { classifyDirection } from '../utils/faceDirection';

/**
 * Face Scan 상태 컨트롤러 훅
 *
 * 이 훅은 스캔의 전체 시나리오(Phase), 현재 진행 중인 방향, 영상 녹화 등을 관리합니다.
 * 실제 카메라 프레임 분석 엔진은 useFaceProcessor로 분리되어 프레임 데이터를 수신합니다.
 */
export function useFaceScan() {
  const cameraRef = useRef<VisionCamera>(null);

  // --- 상태 ---
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(0);
  const [completedDirections, setCompletedDirections] = useState<boolean[]>(
    SCAN_DIRECTIONS.map(() => false)
  );
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isDirectionMatching, setIsDirectionMatching] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // --- 상태 동기화용 Refs (동시성 경합 방어) ---
  const phaseRef = useRef<ScanPhase>('idle');
  const indexRef = useRef(0);

  // --- Refs (타이머 및 홀드 상태 관리) ---
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);

  // --- 권한 및 스캔 시작 ---
  const startScan = useCallback(async () => {
    try {
      const status = await VisionCamera.requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('카메라 권한 필요', '설정에서 카메라 권한을 허용해주세요.');
        return;
      }

      // 상태 초기화 -> 카메라 마운트 유도
      setPhase('scanning'); phaseRef.current = 'scanning';
      setCurrentDirectionIndex(0); indexRef.current = 0;
      setCompletedDirections(SCAN_DIRECTIONS.map(() => false));
      setVideoUri(null);
      setIsDirectionMatching(false);
      setIsCameraReady(false); // 새로운 스캔 세션 시작 시 카메라 준비 상태 초기화
      isHoldingRef.current = false;
    } catch (error) {
      console.error('스캔 시작 오류:', error);
      Alert.alert('오류 발생', '스캔을 시작하는 중 문제가 발생했습니다.');
      setPhase('idle'); phaseRef.current = 'idle';
    }
  }, []);

  // --- 카메라 마운트 및 하드웨어 초기화 완료 후 녹화 시작 로직 ---
  useEffect(() => {
    if (phase === 'scanning' && isCameraReady && cameraRef.current && !videoUri) {
      try {
        cameraRef.current.startRecording({
          onRecordingFinished: (video) => {
            setVideoUri(video.path);
            setPhase('completed'); phaseRef.current = 'completed'; // 비디오 저장이 완료되면 진짜 완료 상태!
          },
          onRecordingError: (error) => {
            console.error('녹화 오류:', error);
            Alert.alert('녹화 오류', '영상 녹화 중 문제가 발생했습니다.');
            setPhase('idle'); phaseRef.current = 'idle';
          },
        });
      } catch (err) {
        console.error('녹화 시작 시점 예외:', err);
      }
    }
  }, [phase, isCameraReady, videoUri]); // cameraRef는 외부 ref이므로 의존성에 넣지 않음 (phase 전환 시점 시도)

  /**
   * [핸들러] 카메라 하드웨어 초기화 완료 시 호출
   */
  const onCameraInitialized = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  /**
   * [핸들러] 얼굴 감지 데이터가 들어오면 호출되는 JS 로직
   * useFaceProcessor에 의해 호출됩니다.
   */
  const handleFaceDetection = useCallback(
    (faces: Face[]) => {
      // 1. 얼굴 미감지 또는 스캔 중 아님 → 홀드 리컬
      if (phaseRef.current !== 'scanning' || faces.length === 0) {
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
      const targetDirection = SCAN_DIRECTIONS[indexRef.current]?.direction;

      // 2. 방향 일치 여부 확인
      if (detected === targetDirection) {
        setIsDirectionMatching(true);

        if (!isHoldingRef.current) {
          isHoldingRef.current = true;
          holdTimerRef.current = setTimeout(() => {
            // 방향 유지 성공! 단계 전환
            setCompletedDirections((prev) => {
              const next = [...prev];
              next[indexRef.current] = true;
              return next;
            });

            const nextIndex = indexRef.current + 1;
            if (nextIndex >= SCAN_DIRECTIONS.length) {
              // 1. 얼굴 각도 패턴 전부 달성 -> 파일 저장 대기 상태로 전환
              setPhase('finalizing'); phaseRef.current = 'finalizing';
              cameraRef.current?.stopRecording();
            } else {
              setCurrentDirectionIndex(nextIndex); indexRef.current = nextIndex;
            }

            isHoldingRef.current = false;
            setIsDirectionMatching(false);
          }, DIRECTION_HOLD_DURATION);
        }
      } else {
        // 방향 불일치 시 리셋
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

  // 클린업
  useEffect(() => {
    return () => {
      // 1. 진행 중인 타이머 정리
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      
      // 2. 언마운트 시 네이티브 녹화 프로세스가 실행 중이면 안전하게 중단
      try {
        if (cameraRef.current) {
          cameraRef.current.stopRecording();
        }
      } catch (error) {
        console.error('클린업 중 녹화 중단 에러 (무시됨):', error);
      }
    };
  }, []);

  // 파생 값
  const currentDirection = SCAN_DIRECTIONS[currentDirectionIndex] ?? SCAN_DIRECTIONS[0];

  return {
    cameraRef,
    phase,
    currentDirection,
    currentDirectionIndex,
    completedDirections,
    isDirectionMatching,
    startScan,
    onCameraInitialized,
    handleFaceDetection,
    videoUri,
  };
}
