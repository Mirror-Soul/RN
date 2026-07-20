import React, { memo } from 'react';
import { FlattenedListItem } from '../types';
import MessageBubble from './MessageBubble';
import MessageDateDivider from './MessageDateDivider';

interface MessageListItemRendererProps {
  item: FlattenedListItem;
  avatarLetter: string;
  avatarGradient: readonly [string, string, ...string[]];
}

/**
 * FlashList의 renderItem을 담당하는 컴포넌트입니다.
 * OCP (개방-폐쇄 원칙): 타입에 따른 렌더링 책임을 분리하여, 새로운 타입 추가 시 확장에 열려있게 합니다.
 */
function MessageListItemRendererComponent({ item, avatarLetter, avatarGradient }: MessageListItemRendererProps) {
  switch (item.type) {
    case 'date':
      return <MessageDateDivider label={item.dateLabel} />;
    
    case 'message':
      return (
        <MessageBubble
          message={item.message}
          avatarLetter={avatarLetter}
          avatarGradient={avatarGradient}
          enterDelay={item.enterDelay}
          hideAvatar={item.hideAvatar}
        />
      );
      
    default:
      return null;
  }
}

function arePropsEqual(prevProps: MessageListItemRendererProps, nextProps: MessageListItemRendererProps) {
  // item의 고유 식별자(id)와 변경될 여지가 있는 원시값들을 기준으로 얕은 비교 한계를 극복합니다.
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.avatarLetter === nextProps.avatarLetter &&
    prevProps.avatarGradient[0] === nextProps.avatarGradient[0] &&
    prevProps.avatarGradient[1] === nextProps.avatarGradient[1]
  );
}

// 불필요한 리렌더링을 방지하기 위해 React.memo에 커스텀 비교 함수를 적용합니다.
export const MessageListItemRenderer = memo(MessageListItemRendererComponent, arePropsEqual);
