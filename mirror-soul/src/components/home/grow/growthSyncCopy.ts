/**
 * 트윈 유사도(Sync Rate) 구간별 헤드라인/서브카피
 *
 * 단순 "N% 입니다" 리포트 문장 대신, 구간에 따라 다른 뉘앙스를 준다:
 * 낮을수록 업데이트를 유도하는 톤, 높을수록 잘 맞는다는 톤으로 자연스럽게 바뀐다.
 * 실제 %는 진행바 라벨(Similarity Sync N% Complete) 한 곳에서만 보여주고,
 * 헤드라인은 숫자를 그대로 읽어주지 않아 "거리 100% / 완료 0%"처럼 같은 값이
 * 반대 방향으로 두 번 보이는 혼란을 없앤다.
 */
export interface SyncCopy {
  headline: string;
  subCopy: string;
}

export function getSyncCopy(syncRate: number): SyncCopy {
  if (syncRate >= 100) {
    return {
      headline: '트윈이 완벽하게\n당신과 하나예요.',
      subCopy: '지금 대화하는 트윈은 진짜 당신처럼 느껴질 거예요.',
    };
  }
  if (syncRate >= 75) {
    return {
      headline: '트윈이 당신과\n아주 가까워졌어요.',
      subCopy: '이제 조금만 더 다듬으면 완벽한 싱크에 도달해요.',
    };
  }
  if (syncRate >= 50) {
    return {
      headline: '트윈이 당신과\n꽤 닮아가고 있어요.',
      subCopy: '더 닮아갈수록, 당신을 완벽히 이해하는 최적의 인연을 만날 확률이 높아져요.',
    };
  }
  if (syncRate >= 25) {
    return {
      headline: '트윈이 당신을\n조금씩 알아가고 있어요.',
      subCopy: '아래 미션을 몇 개만 더 완료하면 훨씬 자연스러워져요.',
    };
  }
  return {
    headline: '트윈이 아직\n당신을 잘 몰라요.',
    subCopy: '목소리와 표정을 들려줄수록 트윈이 당신에게 가까워져요.',
  };
}
