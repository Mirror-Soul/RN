import { useMutation } from '@tanstack/react-query';
import { registerPushDevice } from '@/src/services/pushService';
import type { RegisterPushDeviceRequest } from '@/src/types/api/push';

export const useRegisterPushDeviceMutation = () =>
  useMutation({
    mutationFn: (data: RegisterPushDeviceRequest) => registerPushDevice(data),
  });
