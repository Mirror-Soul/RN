import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modifyNickname } from '@/src/services/profileService';
import type { AccountInfoResult, MyProfileResult } from '@/src/types/api/profile';

/**
 * POST /my-page/account — 닉네임 변경.
 * 백엔드가 Void를 반환하므로, 클라이언트가 이미 아는 새 닉네임으로
 * ['profile','me']/['profile','accountInfo'] 캐시를 낙관적으로 갱신한다 (재조회 불필요).
 */
export const useModifyNicknameMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nickname: string) => modifyNickname(nickname),
    onSuccess: (_response, nickname) => {
      queryClient.setQueryData<MyProfileResult>(['profile', 'me'], (old) =>
        old ? { ...old, name: nickname } : old
      );
      queryClient.setQueryData<AccountInfoResult>(['profile', 'accountInfo'], (old) =>
        old ? { ...old, name: nickname } : old
      );
    },
  });
};
