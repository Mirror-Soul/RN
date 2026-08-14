import { useMutation } from '@tanstack/react-query';
import { registerPushDevice } from '@/src/services/pushDeviceService';
import { getOrCreateInstallationId } from '@/src/utils/installationId';
import { PushDevicePlatform } from '@/src/types/api/push';

interface RegisterPushDeviceParams {
  pushToken: string;
  platform: PushDevicePlatform;
}

/**
 * PUT /push/devices — 로그인 성공 직후 호출.
 *
 * 실제 FCM 토큰 발급(@react-native-firebase/messaging)은 아직 프로젝트에 없어서
 * 이 훅은 pushToken을 인자로 받기만 한다 — Firebase 연동이 준비되면 그 토큰 발급
 * 지점에서 이 훅의 mutate()만 호출하면 되고, 이 훅 자체는 지금 바로 쓸 수 있다.
 *
 * retry: 로그인 직후 네트워크가 일시적으로 불안정한 경우를 대비한 기본 재시도.
 */
export const useRegisterPushDeviceMutation = () =>
  useMutation({
    mutationFn: async ({ pushToken, platform }: RegisterPushDeviceParams) => {
      const installationId = await getOrCreateInstallationId();
      return registerPushDevice({ installationId, pushToken, platform });
    },
    retry: 2,
  });
