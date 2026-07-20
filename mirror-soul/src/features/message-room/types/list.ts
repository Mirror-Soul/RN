import { MessageItem } from './index';

export type MessageListType = 'date' | 'message';

export interface BaseListItem {
  type: MessageListType;
  id: string; // 고유 키 식별자 (FlashList 최적화용)
}

export interface DateListItem extends BaseListItem {
  type: 'date';
  dateLabel: string;
}

export interface MessageBubbleItem extends BaseListItem {
  type: 'message';
  message: MessageItem;
  hideAvatar: boolean;
  enterDelay: number;
}

export type FlattenedListItem = DateListItem | MessageBubbleItem;
