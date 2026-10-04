import { useQuery } from '@tanstack/react-query';
import { getAudioSettings } from '@/src/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { profileQueryKeys } from '@/src/features/profile/hooks/profileQueryKeys';

/** 설정 화면·통화·미리듣기가 같은 서버 볼륨을 사용한다. */
export function useAudioSettingsQuery() {
  const userUuid = useAuthStore(s => s.userUuid);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  return useQuery({
    queryKey: profileQueryKeys.audioSettings(userUuid),
    queryFn: async ({ signal }) => {
      const session = useAuthStore.getState();
      if (!userUuid || !session.isLoggedIn || session.userUuid !== userUuid) throw new Error('다시 로그인해 주세요.');
      return (await getAudioSettings(signal)).result;
    },
    staleTime: 60_000,
    enabled: isLoggedIn && !!userUuid,
  });
}
