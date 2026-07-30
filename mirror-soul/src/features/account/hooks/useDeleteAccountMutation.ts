import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAccount } from '@/src/services/profileService';

/** DELETE /my-page — 회원 탈퇴. 성공 시 캐시된 서버 상태를 남기지 않는다. */
export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
