import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { getPresignedUrl } from '@/src/services/fileService';
import { uploadFileToS3 } from '@/src/services/s3Service';
import { deleteProfileImage, getMyProfile, modifyProfileImage } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { MAX_PROFILE_PHOTO_BYTES } from './photoGeometry';
import type { PreparedProfilePhoto } from './prepareProfilePhoto';
import { mergeProfilePhotoCache } from './profilePhotoCache';
import { copyRegisteredPhotoPreview, discardRegisteredPhotoPreview, registeredPhotoPreviewKey, type RegisteredPhotoPreview } from './registeredPhotoPreview';

export type PhotoSaveStage = 'idle' | 'address' | 'upload' | 'save' | 'delete';
const activeUsers = new Set<string>();

export function useProfilePhotoMutation() {
  const client = useQueryClient();
  const [stage, setStage] = useState<PhotoSaveStage>('idle');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const lock = useRef(false);
  // PUT 성공 후 연결 실패 시 같은 파일을 재업로드하지 않고 PATCH만 재시도한다.
  const uploaded = useRef<{ uri: string; key: string; userUuid: string } | null>(null);
  const mutation = useMutation({
    retry: false,
    mutationFn: async (photo: PreparedProfilePhoto | null) => {
      const userUuid = useAuthStore.getState().userUuid;
      if (!userUuid || !useAuthStore.getState().isLoggedIn) throw new Error('다시 로그인해 주세요.');
      if (activeUsers.has(userUuid)) throw new Error('사진을 저장 중이에요. 잠시 기다려 주세요.');
      activeUsers.add(userUuid);
      setUploadProgress(null);
      let sessionEnded = false;
      const unsubscribe = useAuthStore.subscribe(state => {
        if (!state.isLoggedIn || state.userUuid !== userUuid) sessionEnded = true;
      });
      const assertSession = () => {
        if (sessionEnded) throw new Error('로그인 상태가 변경되어 사진 저장을 중단했어요.');
      };
      try {
        await client.cancelQueries({ queryKey: ['profile'] });
        assertSession();
        let url: string | null;
        if (!photo) {
          setStage('delete');
          try {
            const response = await deleteProfileImage();
            if (!response.isSuccess) throw new Error(response.message);
          } catch (error) {
            assertSession();
            const current = await getMyProfile().catch(() => null);
            if (!current?.isSuccess || current.result.profileImageUrl != null) throw error;
          }
          url = null;
          uploaded.current = null;
        } else {
          const info = await FileSystem.getInfoAsync(photo.uri);
          if (!info.exists || info.isDirectory || info.size <= 0 || info.size > MAX_PROFILE_PHOTO_BYTES) {
            throw new Error('사진을 읽을 수 없거나 용량이 커요. 다시 선택해 주세요.');
          }
          assertSession();
          if (uploaded.current?.uri !== photo.uri || uploaded.current.userUuid !== userUuid) {
            setStage('address');
            const response = await getPresignedUrl({ directory: 'profile-images', contentType: 'image/jpeg', fileName: 'profile.jpg' });
            if (!response.isSuccess || !response.result?.objectKey) throw new Error(response.message || '업로드 주소를 받지 못했어요.');
            assertSession();
            setStage('upload');
            let uploadActive = true;
            try {
              await uploadFileToS3(response.result.presignedUrl, photo.uri, 'image/jpeg', ({ bytesSent, totalBytes }) => {
                if (!uploadActive || sessionEnded || !Number.isFinite(bytesSent) || !Number.isFinite(totalBytes) || totalBytes <= 0 || bytesSent < 0) return;
                const fraction = Math.min(1, bytesSent / totalBytes);
                setUploadProgress(previous => Math.max(previous ?? 0, fraction));
              });
              assertSession();
              setUploadProgress(1);
            } finally { uploadActive = false; }
            assertSession();
            uploaded.current = { uri: photo.uri, key: response.result.objectKey, userUuid };
          }
          const key = uploaded.current.key;
          setStage('save');
          assertSession();
          try {
            const response = await modifyProfileImage(key);
            if (!response.isSuccess || !response.result?.profileImageUrl) throw new Error(response.message || '사진을 프로필에 반영하지 못했어요.');
            url = response.result.profileImageUrl;
          } catch (error) {
            assertSession();
            // 응답 유실인 경우 서버 조회로 확인한다. 새 객체를 업로드하지 않는다.
            const current = await getMyProfile().catch(() => null);
            const currentUrl = current?.isSuccess ? current.result.profileImageUrl : null;
            const path = currentUrl ? decodeURIComponent(currentUrl.split('?')[0]) : '';
            if (!currentUrl || !path.endsWith(`/${key}`)) throw error;
            url = currentUrl;
          }
        }
        assertSession();
        await client.cancelQueries({ queryKey: ['profile'] });
        assertSession();
        const previewKey = registeredPhotoPreviewKey(userUuid);
        const previousPreview = client.getQueryData<RegisteredPhotoPreview | null>(previewKey);
        const localUri = photo && url ? await copyRegisteredPhotoPreview(photo.uri) : null;
        try { assertSession(); }
        catch (error) { await discardRegisteredPhotoPreview(localUri); throw error; }
        client.setQueryData<RegisteredPhotoPreview | null>(previewKey, localUri && url ? { uri: localUri, url } : null);
        mergeProfilePhotoCache(client, url);
        void discardRegisteredPhotoPreview(previousPreview?.uri);
        void client.invalidateQueries({ queryKey: ['profile', 'me'] });
        void client.invalidateQueries({ queryKey: ['profile', 'introduction'] });
        uploaded.current = null;
        return url;
      } finally {
        unsubscribe();
        activeUsers.delete(userUuid);
        setStage('idle');
      }
    },
  });
  const run = async (photo: PreparedProfilePhoto | null) => {
    if (lock.current) return undefined;
    lock.current = true;
    try { return await mutation.mutateAsync(photo); }
    finally { lock.current = false; }
  };
  return { save: (photo: PreparedProfilePhoto) => run(photo), remove: () => run(null), isPending: mutation.isPending, stage, uploadProgress };
}
