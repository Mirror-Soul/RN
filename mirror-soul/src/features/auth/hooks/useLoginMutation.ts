import { useMutation } from '@tanstack/react-query';
import { login } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';

export const useLoginMutation = () =>
  useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: (response) =>
      useAuthStore.getState().login({
        accessToken: response.result.accessToken,
        refreshToken: response.result.refreshToken,
        userUuid: response.result.userUuid,
        userStatus: response.result.userStatus,
      }),
  });
