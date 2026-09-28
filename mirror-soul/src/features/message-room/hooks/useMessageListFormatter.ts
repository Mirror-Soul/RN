import { useMemo } from 'react';
import { MessageDateGroup, FlattenedListItem } from '../types';
import { Animation } from '@/src/constants/theme';

/**
 * 중첩된 MessageDateGroup[] 을 FlashList 가 렌더링하기 편한 1차원 FlattenedListItem[] 으로 변환합니다.
 * 
 * [최적화 & 프로토콜]
 * - FlashList v2의 일반 방향(오래된 메시지 → 최신 메시지)에 맞춰 API 순서를 보존합니다.
 * - 각 아이템은 BaseListItem을 상속한 구조를 따릅니다.
 */
export function useMessageListFormatter(dateGroups: MessageDateGroup[]): FlattenedListItem[] {
  return useMemo(() => {
    const flatList: FlattenedListItem[] = [];
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
          enterDelay: 0, // 순차 진입 효과를 위해 아래에서 재계산
        });
      });
    });

    // 오래된 메시지부터 순차적으로 딜레이를 부여한다. FlashList v2는
    // startRenderingFromBottom으로 첫 진입 위치만 하단으로 맞춘다.
    let messageIndex = 0;
    return flatList.map((item) => {
      if (item.type === 'message') {
        const delay = messageIndex * Animation.staggerDelay;
        messageIndex++;
        return { ...item, enterDelay: delay };
      }
      return item;
    });
  }, [dateGroups]);
}
