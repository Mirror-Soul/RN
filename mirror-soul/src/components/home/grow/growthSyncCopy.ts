export interface SyncCopy { headline: string; subCopy: string }

/** A composite preparation score, capped at 95 by the current contract; not a completion probability. */
export function getSyncCopy(syncRate: number): SyncCopy {
  if (syncRate >= 75) return { headline: '트윈이 당신을\n더 닮아가고 있어요.', subCopy: '내 트윈과 대화하며 목소리와 반응을 확인해 보세요.' };
  if (syncRate >= 50) return { headline: '트윈에 당신의\n모습이 쌓이고 있어요.', subCopy: '목소리와 가치관을 조금씩 더 들려주세요.' };
  if (syncRate >= 25) return { headline: '트윈이 당신을\n알아가고 있어요.', subCopy: '부담 없이 짧은 녹음이나 질문 하나부터 시작해 보세요.' };
  return { headline: '나를 닮은 트윈을\n함께 다듬어봐요.', subCopy: '목소리와 가치관을 알려주면 트윈을 다듬는 데 도움이 돼요.' };
}
