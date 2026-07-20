export type MessageDirection = 'SENT' | 'RECEIVED';

export interface MessageItem {
  id: string;
  text: string;
  direction: MessageDirection;
  timestamp: string; // 'HH:MM' 형식
}

export interface MessageDateGroup {
  date: string; // '오늘', '어제', 'YYYY.MM.DD' 등
  messages: MessageItem[];
}

export interface ChatRoom {
  id: string;
  name: string;
  avatarLetter: string;
  /** 상대 아바타 그라디언트 컬러 (LinearGradient colors) */
  avatarGradient: readonly [string, string, ...string[]];
  resonance: number; // 유사도 %
  isOnline: boolean;
  isRead: boolean; // 상대방이 읽음 여부
  dateGroups: MessageDateGroup[];
}

export * from './list';
