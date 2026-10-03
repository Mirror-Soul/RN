import { useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { saveInterviewAnswer } from '@/src/services/onboardingService';
import { useAuthStore } from '@/src/store/useAuthStore';

type Answer = { uri: string; questionId: number; answerText: string; userUuid: string };
export type InterviewSaveStage = 'idle' | 'address' | 'upload' | 'save';
export function useInterviewUpload() {
  const [stage, setStage] = useState<InterviewSaveStage>('idle');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const lock = useRef(false);
  const uploaded = useRef<{ uri: string; questionId: number; userUuid: string; key: string } | null>(null);
  const mutation = useMutation({
    retry: false,
    mutationFn: async (answer: Answer) => {
      if (!answer.answerText.trim()) throw new Error('인식된 답변을 확인하거나 다시 녹음해주세요.');
      if (!Number.isInteger(answer.questionId) || answer.questionId <= 0) throw new Error('질문을 다시 불러와주세요.');
      let sessionEnded = false;
      const unsubscribe = useAuthStore.subscribe(state => {
        if (!state.isLoggedIn || state.userUuid !== answer.userUuid) sessionEnded = true;
      });
      const assertSession = () => {
        const state = useAuthStore.getState();
        if (sessionEnded || !state.isLoggedIn || state.userUuid !== answer.userUuid) throw new Error('로그인 상태가 바뀌었어요. 다시 로그인해주세요.');
      };
      try {
        assertSession();
        setUploadProgress(null);
        const info = await FileSystem.getInfoAsync(answer.uri);
        if (!info.exists || info.isDirectory || !Number.isFinite(info.size) || info.size <= 0) throw new Error('녹음 파일을 읽지 못했어요. 다시 녹음해주세요.');
        assertSession();
        if (uploaded.current?.uri !== answer.uri || uploaded.current.questionId !== answer.questionId || uploaded.current.userUuid !== answer.userUuid) {
          const extension = Platform.OS === 'ios' ? 'wav' : 'm4a';
          const contentType = Platform.OS === 'ios' ? 'audio/wav' : 'audio/mp4';
          setStage('address');
          const response = await getPresignedUrl({ fileName: `interview-answer-${answer.questionId}.${extension}`, contentType, directory: 'interviews' });
          if (!response.isSuccess || !response.result?.presignedUrl || !response.result.objectKey) throw new Error(response.message || '전송을 준비하지 못했어요. 다시 저장해주세요.');
          assertSession();
          setStage('upload');
          let sending = true;
          try {
            await uploadFileToS3(response.result.presignedUrl, answer.uri, contentType, ({ bytesSent, totalBytes }) => {
              if (!sending || sessionEnded || !Number.isFinite(bytesSent) || !Number.isFinite(totalBytes) || totalBytes <= 0 || bytesSent < 0) return;
              setUploadProgress(previous => Math.max(previous ?? 0, Math.min(1, bytesSent / totalBytes)));
            });
          } finally { sending = false; }
          assertSession();
          setUploadProgress(1);
          uploaded.current = { uri: answer.uri, questionId: answer.questionId, userUuid: answer.userUuid, key: response.result.objectKey };
        }
        setStage('save');
        assertSession();
        const response = await saveInterviewAnswer({ interviewId: answer.questionId, answerAudioObjectKey: uploaded.current.key, answerText: answer.answerText.trim() });
        assertSession();
        if (!response.isSuccess || response.result?.saved !== true || response.result.interviewId !== answer.questionId) throw new Error(response.message || '답변 저장을 확인하지 못했어요. 다시 저장해주세요.');
        uploaded.current = null;
        return true;
      } finally { unsubscribe(); setStage('idle'); }
    },
  });
  const saveAnswer = async (answer: Answer) => {
    if (lock.current) return false;
    lock.current = true;
    try { return await mutation.mutateAsync({ ...answer }); }
    finally { lock.current = false; }
  };
  return { saveAnswer, isUploading: mutation.isPending, stage, uploadProgress };
}
