import { useMemo } from 'react';
import { MessageDateGroup, FlattenedListItem } from '../types';
import { Animation } from '@/src/constants/theme';

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
        const isReceived = msg.direction === 'RECEIVED';
        const prevMsg = group.messages[msgIdx - 1];
        const hideAvatar = isReceived && !!prevMsg && prevMsg.direction === 'RECEIVED';

        flatList.push({
          type: 'message',
          id: msg.id,
          message: msg,
          hideAvatar,
          enterDelay: 0, // 임시 할당 (역순 처리 후 재계산)
        });
      });
    });

    // inverted={true} 인 FlashList 에서는 데이터가 역순으로 들어와야
    // 가장 최신 데이터가 화면 하단(리스트의 시작점)에 렌더링됩니다.
    const reversedList = flatList.reverse();

    // 역순 정렬된 리스트를 기준으로 최신 메시지(index 0)부터 딜레이를 부여합니다.
    let messageIndex = 0;
    return reversedList.map((item) => {
      if (item.type === 'message') {
        const delay = messageIndex * Animation.staggerDelay;
        messageIndex++;
        return { ...item, enterDelay: delay };
      }
      return item;
    });
  }, [dateGroups]);
}
