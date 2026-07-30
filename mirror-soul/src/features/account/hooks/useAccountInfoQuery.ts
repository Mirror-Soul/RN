import { useQuery } from '@tanstack/react-query';
import { getAccountInfo } from '@/src/services/profileService';

/** GET /my-page/account — 계정관리 화면의 닉네임 조회. */
export const useAccountInfoQuery = () =>
  useQuery({
    queryKey: ['profile', 'accountInfo'],
    queryFn: async () => (await getAccountInfo()).result,
    staleTime: 60_000,
  });
