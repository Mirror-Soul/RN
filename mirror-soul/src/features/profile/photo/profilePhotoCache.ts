import type { QueryClient } from '@tanstack/react-query';
import type { MyIntroductionResult, MyProfileResult } from '@/src/types/api/profile';
import { introductionPreview } from '../constants/introductionPreview';

export function mergeProfilePhotoCache(client: QueryClient, profileImageUrl: string | null) {
  // PATCH가 돌려주는 사진 필드로 이름/이메일/소개를 덮어쓰지 않는다.
  client.setQueryData<MyProfileResult>(['profile', 'me'], old => old ? { ...old, profileImageUrl } : undefined);
  // 개발용 fallback의 객체 정체성을 유지해 실제 공개 프로필로 오인하지 않게 한다.
  client.setQueryData<MyIntroductionResult>(['profile', 'introduction'], old => old && old !== introductionPreview ? { ...old, profileImageUrl } : old);
}
