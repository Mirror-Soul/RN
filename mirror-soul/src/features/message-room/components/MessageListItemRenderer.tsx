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

// 불필요한 리렌더링을 방지하기 위해 React.memo로 감쌉니다.
export const MessageListItemRenderer = memo(MessageListItemRendererComponent);
