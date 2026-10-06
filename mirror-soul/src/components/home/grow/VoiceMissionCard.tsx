import React from 'react';
import { router } from 'expo-router';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import GrowthMissionCard from './GrowthMissionCard';

export default function VoiceMissionCard() {
  const { data, isLoading, isError, refetch } = useTwinSyncQuery();
  // The backend counts every VOICE_UPDATE job, including pending/failed jobs, not completed learning.
  const count = typeof data?.voiceTrainingCount === 'number' && Number.isFinite(data.voiceTrainingCount)
    ? Math.max(0, Math.floor(data.voiceTrainingCount)) : null;
  const subtitle = isError ? '녹음 정보를 불러오지 못했어요. 다시 확인해 주세요.'
    : isLoading ? '녹음 정보를 확인하고 있어요.' : '짧은 문장을 평소 목소리로 읽어주세요. 조용한 곳이 좋아요.';
  return <GrowthMissionCard title="목소리 정밀 학습" subtitle={subtitle} icon="mic" tone="pink"
    status={isError ? '다시 확인' : !isLoading && count !== null ? `녹음 제출 ${count}회` : null}
    onPress={isError ? () => { void refetch(); } : () => router.push('/voice-update')}
    error={isError} accessibilityLabel={isError ? '목소리 녹음 정보 다시 확인' : '목소리 정밀 학습 시작'} />;
}
