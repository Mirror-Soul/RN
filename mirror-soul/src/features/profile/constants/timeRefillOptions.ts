export interface TimeRefillOptionData {
  id: string;
  addedTime: string;
  durationLabel: string;
  price: string;
  badge?: {
    text: string;
    icon?: string;
    type: 'popular' | 'best';
  };
  styleType: 'default' | 'highlighted';
}

export const TIME_REFILL_OPTIONS: TimeRefillOptionData[] = [
  {
    id: 'opt_30m',
    addedTime: '+ 30분',
    durationLabel: '30분 동안 이야기 나누기',
    price: '₩4,900',
    styleType: 'default',
  },
  {
    id: 'opt_2h',
    addedTime: '+ 2시간',
    durationLabel: '2시간 동안 이야기 나누기',
    price: '₩14,900',
    badge: {
      text: '인기',
      icon: '👑', // This could also be a vector icon if needed
      type: 'popular',
    },
    styleType: 'highlighted',
  },
  {
    id: 'opt_10h',
    addedTime: '+ 10시간',
    durationLabel: '10시간 가득 채우기',
    price: '₩59,000',
    badge: {
      text: '가장 경제적',
      type: 'best',
    },
    styleType: 'default',
  },
];
