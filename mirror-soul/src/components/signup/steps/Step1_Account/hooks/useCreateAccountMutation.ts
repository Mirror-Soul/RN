import { useMutation } from '@tanstack/react-query';
import { createBasicProfile } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BasicProfileRequest } from '@/src/types/api/auth';

export const useCreateAccountMutation = () =>
  useMutation({
    mutationFn: (data: BasicProfileRequest) => createBasicProfile(data),
    onSuccess: (response) =>
      useAuthStore.getState().login({
        accessToken: response.result.accessToken,
        refreshToken: response.result.refreshToken,
        userUuid: response.result.userUuid,
        userStatus: response.result.userStatus,
      }),
  });
