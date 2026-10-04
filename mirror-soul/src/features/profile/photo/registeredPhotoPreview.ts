import { useQuery } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuthStore } from '@/src/store/useAuthStore';

export interface RegisteredPhotoPreview { url: string; uri: string }
export const registeredPhotoPreviewKey = (userUuid: string | null) => ['registered-photo-preview', userUuid] as const;

/** A session-scoped copy survives the editor deleting its temporary crop file. */
export async function copyRegisteredPhotoPreview(uri: string): Promise<string | null> {
  if (!FileSystem.cacheDirectory) return null;
  const target = `${FileSystem.cacheDirectory}registered-profile-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  try {
    await FileSystem.copyAsync({ from: uri, to: target });
    return target;
  } catch {
    await discardRegisteredPhotoPreview(target);
    return null;
  }
}

export async function discardRegisteredPhotoPreview(uri?: string | null) {
  if (uri) await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
}

export function useRegisteredPhotoPreview() {
  const userUuid = useAuthStore(state => state.userUuid);
  return useQuery<RegisteredPhotoPreview | null>({
    queryKey: registeredPhotoPreviewKey(userUuid),
    queryFn: async () => null,
    enabled: false,
    staleTime: Infinity,
  }).data;
}

/** 다운로드 서명만 갱신된 같은 객체에는 등록 직후 사본을 계속 사용할 수 있다. */
export function registeredPhotoPreviewUri(preview: RegisteredPhotoPreview | null | undefined, url: string | null | undefined) {
  return url && preview?.url.split('?')[0] === url.split('?')[0] ? preview.uri : null;
}
