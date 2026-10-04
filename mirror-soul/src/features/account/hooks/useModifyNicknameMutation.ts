import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/src/store/useAuthStore';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';
import { modifyNickname } from '@/src/services/profileService';
import type { AccountInfoResult, MyProfileResult, MyIntroductionResult } from '@/src/types/api/profile';

/**
 * POST /my-page/account — 닉네임 변경.
 * 백엔드가 Void를 반환하므로, 클라이언트가 이미 아는 새 닉네임으로
 * 저장 성공 후 해당 사용자의 기본·공개·계정 정보 캐시를 갱신한다.
 */
export const useModifyNicknameMutation = () => {
  const queryClient = useQueryClient();
  const userUuid = useAuthStore(state => state.userUuid);

  return useMutation({
    mutationFn: (nickname: string) => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return modifyNickname(nickname);
    },
    onMutate: () => ({ userUuid }),
    onSuccess: async (_response, nickname, context) => {
      const userUuid = context?.userUuid;
      if (!userUuid || userUuid !== useAuthStore.getState().userUuid || !useAuthStore.getState().isLoggedIn) return;
      // 저장 전에 시작된 조회가 옛 닉네임으로 캐시를 되돌리지 않도록 한다.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: profileQueryKeys.me(userUuid) }),
        queryClient.cancelQueries({ queryKey: profileQueryKeys.introduction(userUuid) }),
        queryClient.cancelQueries({ queryKey: profileQueryKeys.accountInfo(userUuid) }),
      ]);
      if (userUuid !== useAuthStore.getState().userUuid || !useAuthStore.getState().isLoggedIn) return;
      queryClient.setQueryData<MyProfileResult>(profileQueryKeys.me(userUuid), (old) =>
        old ? { ...old, name: nickname } : old
      );
      queryClient.setQueryData<MyIntroductionResult>(profileQueryKeys.introduction(userUuid), old =>
        old ? { ...old, name: nickname } : old
      );
      void queryClient.invalidateQueries({ queryKey: profileQueryKeys.introduction(userUuid) });
      queryClient.setQueryData<AccountInfoResult>(profileQueryKeys.accountInfo(userUuid), (old) =>
        old ? { ...old, name: nickname } : old
      );
    },
  });
};
