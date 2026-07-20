/**
 * 메시지방 목업 데이터
 * API 연동 시 이 파일을 useQuery 등의 훅으로 교체합니다.
 */

import { ChatRoom, MessageDateGroup, MessageDirection, MessageItem } from '@/src/features/message-room/types';

export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'c1',
    name: 'Jessica',
    avatarLetter: 'J',
    avatarGradient: ['rgba(194, 122, 255, 0.2)', 'rgba(230, 0, 118, 0.2)'],
    resonance: 92,
    isOnline: true,
    isRead: true,
    dateGroups: [
      {
        date: '오늘',
        messages: [
          { id: 'm1', text: 'Twin이 전해준 제 이야기는 어떠셨나요?', direction: 'RECEIVED', timestamp: '14:20' },
          { id: 'm2', text: '정말 신기했어요! 저도 비슷한 생각을 하고 있었거든요.', direction: 'SENT', timestamp: '14:21' },
          { id: 'm3', text: '맞아요, Twin이 저를 잘 표현해 준 것 같아서 기뻤어요 :)', direction: 'RECEIVED', timestamp: '14:22' },
          { id: 'm4', text: '직접 만나서 더 이야기 나눠보고 싶어요. 어떻게 생각하세요?', direction: 'SENT', timestamp: '14:24' },
          { id: 'm5', text: '저도 좋아요! 이번 주말 어떠세요?', direction: 'RECEIVED', timestamp: '14:25' },
        ],
      },
    ],
  },
  {
    id: 'c2',
    name: 'Sarah',
    avatarLetter: 'S',
    avatarGradient: ['rgba(0, 211, 243, 0.2)', 'rgba(43, 127, 255, 0.2)'],
    resonance: 94,
    isOnline: true,
    isRead: true,
    dateGroups: [
      {
        date: '오늘',
        messages: [
          { id: 'm1', text: '안녕하세요! 아까 Twin이랑 대화 너무 좋았다고 들었어요 :)', direction: 'RECEIVED', timestamp: '16:45' },
          { id: 'm2', text: '네! Sarah님의 Twin이 전시회 이야기를 해주더라구요. 저도 현대 미술 정말 좋아하거든요.', direction: 'SENT', timestamp: '16:46' },
          { id: 'm3', text: '오! 정말요? 혹시 최근에 다녀오신 전시 중에 기억에 남는 게 있으신가요?', direction: 'RECEIVED', timestamp: '16:47' },
          { id: 'm4', text: '지난달에 시립미술관에서 했던 미디어 아트 전시가 정말 좋았어요.', direction: 'SENT', timestamp: '16:48' },
          { id: 'm5', text: '와 저도 거기 가보고 싶었는데! 아쉽게 놓쳤네요 ㅠㅠ', direction: 'RECEIVED', timestamp: '16:50' },
          { id: 'm6', text: '다음에 비슷한 전시 있으면 같이 가보실래요?', direction: 'RECEIVED', timestamp: '16:50' },
        ],
      },
    ],
  },
  {
    id: 'c3',
    name: 'Mia',
    avatarLetter: 'M',
    avatarGradient: ['rgba(194, 122, 255, 0.2)', 'rgba(230, 0, 118, 0.2)'],
    resonance: 87,
    isOnline: false,
    isRead: false,
    dateGroups: [
      {
        date: '어제',
        messages: [
          { id: 'm1', text: '반가워요! 우리 Twin들이 먼저 친해졌네요.', direction: 'RECEIVED', timestamp: '20:10' },
          { id: 'm2', text: '맞아요, 신기하죠? Twin끼리 대화가 잘 통했나봐요 ㅎㅎ', direction: 'SENT', timestamp: '20:12' },
        ],
      },
    ],
  },
];
