import React from 'react';
import { useValueBalanceQuestionQuery } from '@/src/features/growth/hooks/useValueBalanceQuestionQuery';
import GrowthMissionCard from './GrowthMissionCard';
import { valueBalanceUnlockLabel } from './valueBalanceCopy';

export default function ValueBalanceMissionCard({ onPress }: { onPress?: () => void }) {
  const { data, isLoading, isError, refetch } = useValueBalanceQuestionQuery();
  const completed = !isLoading && !isError && data?.completed === true;
  const locked = !isLoading && !isError && data?.locked === true && !completed;
  const unlock = locked ? valueBalanceUnlockLabel(data?.lockedUntil) : null;
  const size = data && Number.isFinite(data.setSize) ? Math.max(1, Math.floor(data.setSize)) : null;
  const answered = data && size && Number.isFinite(data.answeredInSet) ? Math.min(size, Math.max(0, Math.floor(data.answeredInSet))) : null;
  const status = isError ? '다시 확인' : isLoading ? '확인 중' : completed ? '답변 완료' : locked ? '휴식 중' : size && answered !== null ? `이번 세트 ${answered}/${size}` : null;
  const subtitle = isError ? '질문을 불러오지 못했어요. 다시 확인해 주세요.'
    : completed ? '모든 질문에 답했어요. 선택한 답변은 트윈의 가치관을 다듬는 데 쓰여요.'
    : locked ? unlock ? `다음 질문 ${unlock}` : '다음 질문을 기다리고 있어요.'
    : '정답은 없어요. 평소 나에게 가까운 쪽을 골라주세요.';
  return <GrowthMissionCard title="가치관 밸런스 게임" subtitle={subtitle} icon="gamepad" tone="purple" status={status} error={isError}
    accessibilityHint={locked && unlock ? `${subtitle}, 한국 시간 기준. 다음 질문이 열리면 이어서 할 수 있어요.` : undefined}
    onPress={isError ? () => { void refetch(); } : onPress} accessibilityLabel={isError ? '가치관 질문 다시 확인' : '가치관 밸런스 게임'} />;
}
