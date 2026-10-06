import { useState, useCallback, useEffect, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { saveFaceScan } from '@/src/services/onboardingService';
import { completeFaceUpdate } from '@/src/services/evolveService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getErrorMessage } from '@/src/utils/errorUtils';

export function useFaceScanUpload(mode: 'onboarding' | 'update' = 'onboarding') {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [stage, setStage] = useState<'idle' | 'upload' | 'save'>('idle');
  const [requiresLogin, setRequiresLogin] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(true);
  const uploaded = useRef<{ uri: string; owner: string; objectKey: string; fileUrl: string } | null>(null);
  useEffect(() => {
    mounted.current = true;
    let owner = useAuthStore.getState().userUuid;
    const unsubscribe = useAuthStore.subscribe(state => {
      if (!state.isLoggedIn || state.userUuid !== owner) {
        owner = state.userUuid; uploaded.current = null;
        setError(null); setRequiresLogin(false); setProgress(null);
      }
    });
    return () => { mounted.current = false; unsubscribe(); };
  }, []);

  const uploadFaceVideo = useCallback(async (uri: string) => {
    if (lock.current) return false;
    const owner = useAuthStore.getState().userUuid;
    if (!owner || !useAuthStore.getState().isLoggedIn) throw new Error('다시 로그인해 주세요.');
    lock.current = true;
    setIsUploading(true); setError(null); setProgress(null); setRequiresLogin(false);
    let ended = false;
    const unsubscribe = useAuthStore.subscribe(state => {
      if (!state.isLoggedIn || state.userUuid !== owner) ended = true;
    });
    const assertSession = () => {
      const session = useAuthStore.getState();
      if (ended || !mounted.current || !session.isLoggedIn || session.userUuid !== owner) throw new Error('로그인 상태가 변경되어 영상 등록을 중단했어요.');
    };
    try {
      const info = await FileSystem.getInfoAsync(uri);
      assertSession();
      if (!info.exists || info.isDirectory || !Number.isFinite(info.size) || info.size <= 0 || info.size > 100 * 1024 * 1024) throw new Error('영상을 읽을 수 없거나 용량이 커요. 다시 촬영해주세요.');
      if (uploaded.current?.uri !== uri || uploaded.current.owner !== owner) {
        setStage('upload');
        const response = await getPresignedUrl({ fileName: 'face-capture.mp4', contentType: 'video/mp4', directory: 'face-videos' });
        assertSession();
        if (!response.isSuccess || !response.result?.objectKey || !response.result.presignedUrl) throw new Error(response.message || '업로드 주소를 받지 못했어요.');
        let transferActive = true;
        try {
          await uploadFileToS3(response.result.presignedUrl, uri, 'video/mp4', ({ bytesSent, totalBytes }) => {
            if (!transferActive || ended || !mounted.current || !Number.isFinite(totalBytes) || totalBytes <= 0 || !Number.isFinite(bytesSent) || bytesSent < 0) return;
            setProgress(previous => Math.max(previous ?? 0, Math.min(1, bytesSent / totalBytes)));
          });
        } finally { transferActive = false; }
        assertSession();
        uploaded.current = { uri, owner, objectKey: response.result.objectKey, fileUrl: response.result.fileUrl };
      }
      setProgress(1); setStage('save');
      const { objectKey, fileUrl } = uploaded.current;
      if (mode === 'update') {
        const response = await completeFaceUpdate({ objectKey });
        assertSession();
        if (!response.isSuccess || !response.result || !Number.isInteger(response.result.jobId) || response.result.jobId <= 0 || !['PENDING', 'PROCESSING', 'COMPLETED'].includes(response.result.status)) throw new Error('얼굴 학습 접수를 확인하지 못했어요. 다시 시도해주세요.');
        return true;
      }
      const response = await saveFaceScan({ objectKey, fileUrl });
      assertSession();
      if (!response.isSuccess || !response.result?.saved || response.result.objectKey !== objectKey || response.result.userUuid !== owner) throw new Error(response.message || '영상 등록을 확인하지 못했어요. 다시 시도해주세요.');
      return true;
    } catch (cause) {
      if (mounted.current && !ended) {
        const forbidden = typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === 'AUTH_4030';
        setRequiresLogin(forbidden);
        setError(forbidden ? mode === 'update' ? '현재 계정에서 얼굴 학습을 요청할 수 없어요. 다시 로그인하여 계정 상태를 확인해주세요.' : '이미 등록됐거나 현재 단계에서 등록할 수 없어요. 다시 로그인하여 가입 완료 여부를 확인해주세요.' : getErrorMessage(cause, '영상 등록에 실패했어요. 네트워크를 확인해주세요.'));
      }
      throw cause;
    } finally {
      unsubscribe(); lock.current = false;
      if (mounted.current) { setIsUploading(false); setStage('idle'); }
    }
  }, [mode]);
  return { uploadFaceVideo, isUploading, error, progress, stage, requiresLogin, clearError: () => { if (!lock.current) { setError(null); setRequiresLogin(false); } } };
}
