/** 사용자별 캐시를 분리한다. 앞의 두 항목은 도메인 전체 무효화에 사용한다. */
export const profileQueryKeys = {
  me: (userUuid: string | null) => ['profile', 'me', userUuid] as const,
  introduction: (userUuid: string | null) => ['profile', 'introduction', userUuid] as const,
  twinSync: (userUuid: string | null) => ['growth', 'twinSync', userUuid] as const,
  audioSettings: (userUuid: string | null) => ['profile', 'audioSettings', userUuid] as const,
  alarmSettings: (userUuid: string | null) => ['profile', 'alarmSettings', userUuid] as const,
  accountInfo: (userUuid: string | null) => ['profile', 'accountInfo', userUuid] as const,
};
