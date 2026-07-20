import { useMemo } from 'react';
import { MessageDateGroup, FlattenedListItem } from '../types';

/**
 * 중첩된 MessageDateGroup[] 을 FlashList 가 렌더링하기 편한 1차원 FlattenedListItem[] 으로 변환합니다.
 * 
 * [최적화 & 프로토콜]
 * - inverted=true 방식에 맞춰 최신 메시지가 배열의 맨 앞(index 0)에 오도록 배열을 Reverse 합니다.
 * - 각 아이템은 BaseListItem을 상속한 구조를 따릅니다.
 */
export function useMessageListFormatter(dateGroups: MessageDateGroup[]): FlattenedListItem[] {
  return useMemo(() => {
    const flatList: FlattenedListItem[] = [];
    let msgOffset = 0;

    // 원본 데이터를 순회하며 1차원 배열로 평탄화 (Flat)
    dateGroups.forEach((group) => {
      // 1. 날짜 구분선 데이터 삽입
      flatList.push({
        type: 'date',
        id: `date-${group.date}`,
        dateLabel: group.date,
      });

      // 2. 메시지 아이템들 삽입
      group.messages.forEach((msg, msgIdx) => {
        const globalIdx = msgOffset + msgIdx;
        const isReceived = msg.direction === 'RECEIVED';
        const prevMsg = group.messages[msgIdx - 1];
        const hideAvatar = isReceived && !!prevMsg && prevMsg.direction === 'RECEIVED';

        flatList.push({
          type: 'message',
          id: msg.id,
          message: msg,
          hideAvatar,
          enterDelay: globalIdx * 60, // 등장 애니메이션을 위한 딜레이 계산
        });
      });

      msgOffset += group.messages.length;
    });

    // inverted={true} 인 FlashList 에서는 데이터가 역순으로 들어와야
    // 가장 최신 데이터가 화면 하단(리스트의 시작점)에 렌더링됩니다.
    return flatList.reverse();
  }, [dateGroups]);
}
