import { HistoryCallItemData } from '@/src/components/home/history/parts/HistoryCallCard';

/**
 * 통화 기록 Mock 데이터 (임시 — API 연동 시 제거)
 * HistoryList 및 CallDetail 화면에서 공유 사용합니다.
 */
export const MOCK_CALL_HISTORY: HistoryCallItemData[] = [
  {
    id: '1',
    name: '수빈',
    age: 28,
    consistencyPercent: 94,
    callSequenceNumber: 2,
    dateStr: '오늘',
    timeStr: '14:30',
    direction: 'SENT',
    callTypeDesc: '내가 시작한 통화',
    durationLabel: '8분 23초',
    twinMatchLabel: '상대 Twin 92%',
    tags: ['음악', '전시회', '크리에이티브'],
    isNew: true,
    satisfactionPercent: 92,
    messages: [
      {
        id: 'm1',
        direction: 'RECEIVED',
        text: '안녕하세요! 처음 뵙겠습니다.',
        timestamp: '11:15',
      },
      {
        id: 'm2',
        direction: 'SENT',
        text: '안녕하세요 수빈님! 반가워요.',
        timestamp: '11:15',
      },
      {
        id: 'm3',
        direction: 'RECEIVED',
        text: '프로필 보니까 요가에 관심 있으시던데, 저도 요가를 정말 좋아해요!',
        timestamp: '11:16',
      },
      {
        id: 'm4',
        direction: 'SENT',
        text: '오 정말요? 저는 주로 아침에 하는데, 수빈님는 언제 하세요?',
        timestamp: '11:16',
        isEdited: true,
      },
      {
        id: 'm5',
        direction: 'RECEIVED',
        text: '저는 퇴근 후에 주로 해요. 하루의 스트레스를 풀기에 딱 좋더라구요.',
        timestamp: '11:17',
      },
      {
        id: 'm6',
        direction: 'SENT',
        text: '그것도 좋은 방법이네요! 명상도 같이 하시나요?',
        timestamp: '11:18',
      },
    ],
  },
  {
    id: '2',
    name: '지우',
    age: 26,
    consistencyPercent: 88,
    callSequenceNumber: 1,
    dateStr: '오늘',
    timeStr: '11:15',
    direction: 'RECEIVED',
    callTypeDesc: '상대방이 시작한 통화',
    durationLabel: '12분 40초',
    twinMatchLabel: '상대 Twin 85%',
    tags: ['여행', '맛집'],
    isNew: true,
    satisfactionPercent: 88,
    messages: [
      {
        id: 'm1',
        direction: 'RECEIVED',
        text: '안녕하세요! 지우예요.',
        timestamp: '21:15',
      },
      {
        id: 'm2',
        direction: 'SENT',
        text: '안녕하세요 지우님! 처음 이야기 나눠보네요.',
        timestamp: '21:15',
      },
    ],
  },
  {
    id: '3',
    name: '예진',
    age: 29,
    consistencyPercent: 87,
    callSequenceNumber: 3,
    dateStr: '어제',
    timeStr: '19:20',
    direction: 'SENT',
    callTypeDesc: '내가 시작한 통화',
    durationLabel: '15분 10초',
    twinMatchLabel: '상대 Twin 95%',
    tags: ['여행 기록', '사진', '긍정 에너지'],
    isNew: false,
    satisfactionPercent: 95,
    messages: [
      {
        id: 'm1',
        direction: 'RECEIVED',
        text: '안녕하세요! 예진이에요.',
        timestamp: '19:20',
      },
    ],
  },
  {
    id: '4',
    name: '수빈',
    age: 28,
    consistencyPercent: 94,
    callSequenceNumber: 1,
    dateStr: '어제',
    timeStr: '16:45',
    direction: 'RECEIVED',
    callTypeDesc: '상대방이 시작한 통화',
    durationLabel: '6분 30초',
    twinMatchLabel: '상대 Twin 90%',
    tags: ['책', '갤러리', '창의적인 생각'],
    isNew: false,
    satisfactionPercent: 90,
    messages: [
      {
        id: 'm1',
        direction: 'RECEIVED',
        text: '안녕하세요! 오늘 전시 어떠셨어요?',
        timestamp: '16:45',
      },
    ],
  },
];

/**
 * 주간 통계 Mock 데이터 (임시 — API 연동 시 제거)
 * HistoryStatsRow에서 사용합니다.
 */
export const MOCK_WEEKLY_STATS = {
  totalHours: 12.5,
  received: 8,
  sent: 4,
  weeklyGrowthPercent: 12,
} as const;
