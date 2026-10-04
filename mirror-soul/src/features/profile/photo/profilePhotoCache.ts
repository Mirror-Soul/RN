import type { QueryClient } from '@tanstack/react-query';
import type { MyIntroductionResult, MyProfileResult } from '@/src/types/api/profile';
import { profileQueryKeys } from '../hooks/profileQueryKeys';

export function mergeProfilePhotoCache(client: QueryClient, profileImageUrl: string | null, userUuid: string) {
  // 사진 외 필드와 다른 계정의 캐시를 유지한다.
  client.setQueryData<MyProfileResult>(profileQueryKeys.me(userUuid), old => old ? { ...old, profileImageUrl } : undefined);
  client.setQueryData<MyIntroductionResult>(profileQueryKeys.introduction(userUuid), old => old ? { ...old, profileImageUrl } : undefined);
}
