/**
 * 고객센터 FAQ 데이터
 *
 * 텍스트 수정이 필요할 때 이 파일만 편집하면 됩니다.
 * 화면 컴포넌트는 이 데이터를 그대로 렌더링합니다.
 */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'time_refill',
    question: '대화 시간 충전은 어떻게 하나요?',
    answer:
      '프로필 화면의 "시간 채우기" 버튼을 눌러 원하는 시간 패키지를 선택하면 됩니다. 충전된 시간은 대화가 시작되면 실시간으로 차감됩니다.',
  },
  {
    id: 'no_sound',
    question: '통화 중 소리가 안 들려요.',
    answer:
      '먼저 기기 볼륨을 확인하시고, 프로필 → 음성 및 오디오에서 목소리 크기 슬라이더를 조절해 보세요. 그래도 해결되지 않으면 앱을 재시작해 주세요.',
  },
  {
    id: 'account_delete',
    question: '계정 탈퇴는 어떻게 하나요?',
    answer:
      '프로필 화면 맨 아래의 "탈퇴하기"를 눌러 진행할 수 있습니다. 탈퇴 시 모든 대화 기록과 잔여 시간은 복구되지 않으니 신중하게 결정해 주세요.',
  },
  {
    id: 'time_missing',
    question: '충전한 시간이 사라졌어요.',
    answer:
      '시간은 대화가 진행되는 동안 차감됩니다. 이메일 문의를 통해 사용 내역을 확인해 드릴 수 있습니다.',
  },
];

export const SUPPORT_EMAIL = 'support@mirrorsoul.app';
