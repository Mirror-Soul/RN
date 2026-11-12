import { create } from 'zustand';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { submitJobDocuments } from '@/src/services/jobVerificationService';
import { queryClient } from '@/src/services/queryClient';
import { jobReviewKey } from './useJobReviewQuery';
import { deleteEvidencePhoto, MAX_EVIDENCE_BYTES, type EvidencePhoto } from './prepareEvidencePhoto';
import type { JobEnum } from '@/src/types/api/onboarding';
import type { JobReviewResult } from '@/src/types/api/jobVerification';

interface EvidenceDraft {
  owner: string | null; job: JobEnum | null; photos: EvidencePhoto[];
  keys: Record<string, string>; generation: number; busy: boolean;
  phase: string; error: string | null; progress: number | null;
}
const empty = { photos: [], keys: {}, busy: false, phase: '', error: null, progress: null };
/** 같은 세션에서는 이어서 제출할 수 있다. 사진을 영구 보관하거나 다른 계정에 넘기지 않는다. */
export const useEvidenceDraft = create<EvidenceDraft>(() => ({ ...empty, owner: null, job: null, generation: 0 }));
export function resetEvidenceDraft(owner: string | null = null, job: JobEnum | null = null) {
  const old = useEvidenceDraft.getState();
  useEvidenceDraft.setState({ ...empty, owner, job, generation: old.generation + 1 });
  void Promise.all(old.photos.map(deleteEvidencePhoto));
}
export function syncEvidenceDraft(owner: string | null, job: JobEnum | null) {
  const draft = useEvidenceDraft.getState();
  if (draft.owner !== owner || (job && draft.job !== job)) resetEvidenceDraft(owner, job);
}
export function evidenceSessionValid(owner: string, generation: number) {
  const session = useAuthStore.getState();
  const draft = useEvidenceDraft.getState();
  return session.isLoggedIn && session.userUuid === owner && draft.owner === owner && draft.generation === generation;
}
export function addEvidencePhoto(photo: EvidencePhoto, replaceId?: string) {
  const draft = useEvidenceDraft.getState();
  const photos = replaceId ? draft.photos.map(p => p.id === replaceId ? photo : p) : [...draft.photos, photo];
  if (photos.length > 5 || !photos.some(p => p.id === photo.id)) { void deleteEvidencePhoto(photo); return; }
  const previous = draft.photos.find(p => p.id === replaceId);
  useEvidenceDraft.setState({ photos, error: null });
  if (previous) void deleteEvidencePhoto(previous);
}
export function removeEvidence(id: string) {
  const draft = useEvidenceDraft.getState();
  if (draft.busy) return;
  useEvidenceDraft.setState({ photos: draft.photos.filter(p => p.id !== id), error: null });
  const photo = draft.photos.find(p => p.id === id);
  if (photo) void deleteEvidencePhoto(photo);
}
/** same keys/order survive a response loss: retry POST, never silently create new evidence. */
export async function submitEvidenceDraft() {
  const initial = useEvidenceDraft.getState();
  if (initial.busy) throw new Error('서류를 보내고 있어요. 잠시만 기다려 주세요.');
  if (!initial.owner || !initial.job || !initial.photos.length) throw new Error('직군을 확인하고 사진을 추가해 주세요.');
  if (initial.photos.some(p => p.previewFailed)) throw new Error('미리보기를 확인할 수 없는 사진을 바꾸거나 삭제해 주세요.');
  if (initial.photos.length > 5 || initial.photos.some(p => p.size <= 0 || p.size > MAX_EVIDENCE_BYTES)) throw new Error('사진은 최대 5장, 한 장당 5MB 이하로 준비해 주세요.');
  const owner = initial.owner; const generation = initial.generation;
  const assertSession = () => { if (!evidenceSessionValid(owner, generation)) throw new Error('계정이 바뀌었어요. 다시 로그인해 주세요.'); };
  assertSession();
  useEvidenceDraft.setState({ busy: true, error: null, phase: '사진을 보내고 있어요', progress: 0 });
  try {
    const keys: string[] = [];
    const totalBytes = initial.photos.reduce((sum, photo) => sum + photo.size, 0);
    let completedBytes = 0;
    for (let i = 0; i < initial.photos.length; i++) {
      const photo = initial.photos[i];
      assertSession();
      let key = useEvidenceDraft.getState().keys[photo.id];
      if (!key) {
        const response = await getPresignedUrl({ directory: 'job-certifications', contentType: 'image/jpeg', fileName: `job-evidence-${i + 1}.jpg` });
        assertSession();
        await uploadFileToS3(response.result.presignedUrl, photo.uri, 'image/jpeg', p => {
          if (evidenceSessionValid(owner, generation) && p.totalBytes > 0) useEvidenceDraft.setState({ progress: Math.min(100, Math.round((completedBytes + photo.size * Math.min(1, p.bytesSent / p.totalBytes)) / totalBytes * 100)) });
        });
        assertSession();
        key = response.result.objectKey;
        useEvidenceDraft.setState(s => ({ keys: { ...s.keys, [photo.id]: key } }));
      }
      keys.push(key);
      completedBytes += photo.size;
      useEvidenceDraft.setState({ progress: Math.min(100, Math.round(completedBytes / totalBytes * 100)) });
    }
    assertSession();
    useEvidenceDraft.setState({ phase: '심사를 접수하고 있어요', progress: null });
    const response = await submitJobDocuments(keys);
    assertSession();
    if (!response.isSuccess || !response.result?.requestId) throw new Error('신청 상태를 확인하지 못했어요. 같은 사진으로 다시 시도해 주세요.');
    queryClient.setQueryData<JobReviewResult>(jobReviewKey(owner), {
      requestId: response.result.requestId, status: response.result.status, claimedJob: response.result.claimedJob,
      submittedAt: null, reviewedAt: null, rejectionReason: null,
      appliesToCurrentJob: response.result.claimedJob === initial.job,
      passVerificationRequired: false,
    });
    resetEvidenceDraft(owner, initial.job);
    void queryClient.invalidateQueries({ queryKey: jobReviewKey(owner) });
    void queryClient.invalidateQueries({ queryKey: ['profile', 'introduction', owner] });
    return response.result;
  } finally {
    if (evidenceSessionValid(owner, generation)) useEvidenceDraft.setState({ busy: false, phase: '', progress: null });
  }
}
