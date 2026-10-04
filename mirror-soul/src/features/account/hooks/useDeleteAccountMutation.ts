import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAccount } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';

/** DELETE /my-page — 회원 탈퇴. 성공 시 캐시된 서버 상태를 남기지 않는다. */
export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();
  const userUuid = useAuthStore(state => state.userUuid);

  return useMutation({
    mutationFn: () => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return deleteAccount();
    },
    onMutate: () => ({ userUuid }),
    onSuccess: (_response, _variables, context) => {
      const session = useAuthStore.getState();
      if (session.isLoggedIn && session.userUuid === context.userUuid) queryClient.clear();
    },
  });
};
