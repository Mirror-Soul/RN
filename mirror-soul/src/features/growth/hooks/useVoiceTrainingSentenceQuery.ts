import { useQuery } from '@tanstack/react-query';
import { getVoiceTrainingSentence } from '@/src/services/evolveService';

/**
 * GET /evolve/voice — 낭독할 문장 조회.
 * 호출마다 랜덤 문장을 새로 받아야 하므로 staleTime을 0으로 둬서 화면 진입 시마다,
 * 그리고 "다른 문장 읽어보기"에서 refetch() 호출 시마다 항상 새로 요청한다.
 */
export const useVoiceTrainingSentenceQuery = () => {
  return useQuery({
    queryKey: ['growth', 'voiceTrainingSentence'],
    queryFn: async () => (await getVoiceTrainingSentence()).result,
    staleTime: 0,
  });
};
