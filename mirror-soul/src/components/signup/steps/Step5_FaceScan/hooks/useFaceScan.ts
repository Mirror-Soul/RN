import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import type { Face } from 'react-native-vision-camera-face-detector';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuthStore } from '@/src/store/useAuthStore';
import { FRAME_FRESHNESS_MS, MAX_CAPTURE_DURATION, SCAN_DIRECTIONS } from '../constants/faceScanConfig';
import type { ScanPhase } from '../types/faceScan';
import { assessFace, validFrameDelta, type PreviewSize } from '../utils/captureQuality';

const fileUri = (path: string) => path.startsWith('file://') ? path : `file://${path}`;
const discard = (path: string | null) => { if (path) void FileSystem.deleteAsync(fileUri(path), { idempotent: true }).catch(() => {}); };

export function useFaceScan() {
  const cameraRef = useRef<Camera>(null);
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const phaseRef = useRef<ScanPhase>('idle');
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const videoRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const readyRef = useRef(false);
  const [matching, setMatching] = useState(false);
  const [feedback, setFeedback] = useState('얼굴과 어깨를 가이드에 맞춰주세요.');
  const [stageProgress, setStageProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [captureId, setCaptureId] = useState(0);
  const mounted = useRef(true);
  const run = useRef(0);
  const opening = useRef(false);
  const recording = useRef(false);
  const size = useRef<PreviewSize>({ width: 0, height: 0 });
  const latest = useRef<{ at: number; matching: boolean } | null>(null);
  const previous = useRef<number | null>(null);
  const elapsed = useRef(0);
  const startedAt = useRef(0);
  const countdownAt = useRef(0);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transition = useCallback((next: ScanPhase) => {
    phaseRef.current = next;
    if (mounted.current) setPhase(next);
  }, []);

  const cancelScan = useCallback((message?: string) => {
    run.current += 1;
    opening.current = false;
    if (finishTimer.current) clearTimeout(finishTimer.current);
    finishTimer.current = null;
    if (recording.current) {
      recording.current = false;
      // 네이티브 비동기 취소 실패도 회수한다.
      try { void cameraRef.current?.cancelRecording().catch(() => {}); } catch { /* already disposed */ }
    }
    discard(videoRef.current);
    videoRef.current = null;
    readyRef.current = false;
    latest.current = null;
    previous.current = null;
    transition('idle');
    if (mounted.current) {
      setVideoUri(null);
      setCameraReady(false);
      setMatching(false);
      setError(message ?? null);
    }
  }, [transition]);

  const startScan = useCallback(async () => {
    if (opening.current || !['idle', 'completed'].includes(phaseRef.current)) return;
    const owner = useAuthStore.getState().userUuid;
    if (!owner || !useAuthStore.getState().isLoggedIn) { setError('다시 로그인해 주세요.'); return; }
    opening.current = true;
    const token = ++run.current;
    try {
      const permission = await Camera.requestCameraPermission();
      if (!mounted.current || token !== run.current || useAuthStore.getState().userUuid !== owner || AppState.currentState === 'background') return;
      if (permission !== 'granted') { setError('카메라 권한이 필요해요. 기기 설정에서 허용해주세요.'); return; }
      discard(videoRef.current);
      videoRef.current = null;
      setVideoUri(null);
      setError(null);
      setIndex(0); indexRef.current = 0;
      elapsed.current = 0; previous.current = null; latest.current = null;
      setStageProgress(0); setMatching(false); setCountdown(3);
      setCameraReady(false); readyRef.current = false;
      setCaptureId(token);
      setFeedback('얼굴과 어깨를 가이드에 맞춰주세요.');
      transition('positioning');
    } catch { if (mounted.current && token === run.current) setError('카메라를 열지 못했어요. 다시 시도해주세요.'); }
    finally { if (token === run.current) opening.current = false; }
  }, [transition]);

  const beginRecording = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera || !readyRef.current || phaseRef.current !== 'countdown') return;
    const token = run.current;
    recording.current = true;
    startedAt.current = Date.now();
    previous.current = null;
    transition('scanning');
    try {
      camera.startRecording({
        fileType: 'mp4', videoCodec: 'h264',
        onRecordingFinished: video => {
          if (!mounted.current || token !== run.current) { discard(video.path); return; }
          recording.current = false;
          if (finishTimer.current) clearTimeout(finishTimer.current);
          finishTimer.current = null;
          if (phaseRef.current !== 'finalizing' || indexRef.current !== SCAN_DIRECTIONS.length - 1 || !Number.isFinite(video.duration) || video.duration < 20) {
            discard(video.path);
            cancelScan('촬영이 중간에 끝났어요. 처음부터 다시 촬영해주세요.');
            return;
          }
          videoRef.current = fileUri(video.path);
          setVideoUri(videoRef.current);
          transition('completed');
        },
        onRecordingError: () => { if (mounted.current && token === run.current) cancelScan('촬영을 마치지 못했어요. 다시 시도해주세요.'); },
      });
    } catch { cancelScan('촬영을 시작하지 못했어요. 다시 시도해주세요.'); }
  }, [cancelScan, transition]);

  const beginCountdown = useCallback(() => {
    if (phaseRef.current !== 'positioning' || !readyRef.current || !latest.current?.matching || Date.now() - latest.current.at > FRAME_FRESHNESS_MS) return;
    setCountdown(3);
    countdownAt.current = Date.now();
    transition('countdown');
  }, [transition]);

  const handleFaceDetection = useCallback((faces: Face[]) => {
    if (!['positioning', 'countdown', 'scanning'].includes(phaseRef.current)) return;
    const now = Date.now();
    const step = SCAN_DIRECTIONS[indexRef.current];
    const quality = assessFace(faces, size.current, step.direction);
    latest.current = { at: now, matching: quality.matching };
    setMatching(quality.matching);
    setFeedback(quality.message);
    if (phaseRef.current !== 'scanning') return;
    const delta = quality.matching ? validFrameDelta(previous.current, now) : 0;
    previous.current = quality.matching ? now : null;
    elapsed.current += delta;
    setStageProgress(Math.min(1, elapsed.current / step.duration));
    if (elapsed.current < step.duration) return;
    elapsed.current = 0;
    previous.current = null;
    if (indexRef.current < SCAN_DIRECTIONS.length - 1) {
      indexRef.current += 1;
      setIndex(indexRef.current);
      setStageProgress(0);
      setMatching(false);
      latest.current = null;
    } else {
      transition('finalizing');
      const token = run.current;
      finishTimer.current = setTimeout(() => {
        if (token === run.current) cancelScan('영상 저장이 지연됐어요. 다시 촬영해주세요.');
      }, 10000);
      try {
        void cameraRef.current?.stopRecording().catch(() => {
          if (token === run.current && phaseRef.current === 'finalizing') cancelScan('영상을 저장하지 못했어요. 다시 촬영해주세요.');
        });
      } catch { cancelScan('영상을 저장하지 못했어요. 다시 촬영해주세요.'); }
    }
  }, [cancelScan, transition]);

  useEffect(() => {
    if (phase !== 'positioning' || cameraReady) return;
    const token = run.current;
    const timer = setTimeout(() => {
      if (token === run.current && !readyRef.current) cancelScan('카메라 준비가 지연됐어요. 다시 시작해주세요.');
    }, 15000);
    return () => clearTimeout(timer);
  }, [phase, cameraReady, cancelScan]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!['positioning', 'countdown', 'scanning'].includes(phaseRef.current)) return;
      const now = Date.now();
      const fresh = !!latest.current?.matching && now - latest.current.at <= FRAME_FRESHNESS_MS;
      if (!fresh) {
        setMatching(false); previous.current = null;
        if (!latest.current || now - latest.current.at > FRAME_FRESHNESS_MS) setFeedback('얼굴이 보이도록 화면을 맞춰주세요.');
      }
      if (phaseRef.current === 'countdown') {
        if (!fresh) { transition('positioning'); setCountdown(3); return; }
        const remaining = 3 - Math.floor((now - countdownAt.current) / 1000);
        setCountdown(Math.max(1, remaining));
        if (remaining <= 0) beginRecording();
      }
      if (phaseRef.current === 'scanning' && now - startedAt.current >= MAX_CAPTURE_DURATION) cancelScan('촬영이 길어졌어요. 밝은 곳에서 구도를 맞추고 다시 시도해주세요.');
    }, 100);
    const app = AppState.addEventListener('change', state => {
      // iOS 권한 팝업의 inactive는 정상이다. 실제 촬영의 인터럽트는 폐기한다.
      if ((state === 'background' && opening.current) || (state !== 'active' && ['positioning', 'countdown', 'scanning', 'finalizing'].includes(phaseRef.current))) cancelScan('촬영이 중단됐어요. 준비되면 다시 시작해주세요.');
    });
    let owner = useAuthStore.getState().userUuid;
    const unsubscribe = useAuthStore.subscribe(state => {
      if (!state.isLoggedIn || state.userUuid !== owner) { owner = state.userUuid; cancelScan('로그인 상태가 바뀌었어요. 다시 로그인해주세요.'); }
    });
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearInterval(timer); app.remove(); unsubscribe(); cancelScan();
    };
  }, [beginRecording, cancelScan, transition]);

  return {
    cameraRef, phase, videoUri, error, cameraReady, matching, feedback, countdown, stageProgress, captureId,
    currentDirection: SCAN_DIRECTIONS[index], currentDirectionIndex: index,
    startScan, cancelScan, beginCountdown, handleFaceDetection,
    onCameraStarted: () => { if (mounted.current && captureId === run.current && phaseRef.current === 'positioning') { readyRef.current = true; setCameraReady(true); } },
    onCameraError: () => { if (mounted.current && captureId === run.current && ['positioning', 'countdown', 'scanning', 'finalizing'].includes(phaseRef.current)) cancelScan('카메라 연결을 확인해주세요. 다시 시작할 수 있어요.'); },
    setPreviewSize: (value: PreviewSize) => { size.current = value; latest.current = null; previous.current = null; setMatching(false); },
  };
}
