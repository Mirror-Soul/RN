export const Colors = {
  primary: {
    electricCyan: '#00D3F3', // Brand Cyan
    vividPurple: '#C27AFF', // Brand Purple
    soulBlack: '#000000',
    successGreen: '#05DF72', // Verification Success Green
    recordingRed: '#FB2C36', // 녹음 중 버튼 및 포인트 컬러
    activeRedText: '#FF6467', // "실시간 음성 인식 중" 텍스트 컬러
    goldText: '#FFDF20',      // "NEW" 배지 텍스트 컬러
  },
  gradient: {
    cyanToPurple: ['#00D3F3', '#C27AFF'] as [string, string],
    cyanBluePurple: ['#00D3F3', '#51A2FF', '#C27AFF'] as [string, string, string], // 녹음 버튼용
  },
  neutral: {
    pureWhite: '#FFFFFF',
    lightGray: '#99A1AF',
    darkGray: '#6A7282',
    disabledText: '#4A5565',
    lightGrayText: '#D1D5DC',
    lavender: '#DAB2FF',           // 통화 상세 알림 텍스트
  },
  glass: {
    white5: 'rgba(255, 255, 255, 0.05)',
    white10: 'rgba(255, 255, 255, 0.10)',
    white20: 'rgba(255, 255, 255, 0.20)',
    white30: 'rgba(255, 255, 255, 0.30)',
    cyan18: 'rgba(0, 255, 255, 0.18)',
    cyan20: 'rgba(0, 211, 243, 0.20)',
    purple18: 'rgba(147, 51, 234, 0.18)',
    purple08: 'rgba(142, 85, 236, 0.08)',
    purple20: 'rgba(194, 122, 255, 0.20)',
    purple30: 'rgba(194, 122, 255, 0.30)',
    // MBTI Specific (9333EA based)
    purple80: 'rgba(147, 51, 234, 0.80)',
    purple30_mbti: 'rgba(147, 51, 234, 0.30)',
    purple10_mbti: 'rgba(147, 51, 234, 0.10)',
    // MBTI Specific (00FFFF based)
    cyan80: 'rgba(0, 255, 255, 0.80)',
    cyan30: 'rgba(0, 255, 255, 0.30)',
    cyan10: 'rgba(0, 255, 255, 0.10)',
    green10: 'rgba(5, 223, 114, 0.10)',
    green20: 'rgba(5, 223, 114, 0.20)',
    slate95: 'rgba(16, 24, 40, 0.95)',
    purple10: 'rgba(194, 122, 255, 0.10)', // 통화 상세 알림 배너 배경
    purple50: 'rgba(194, 122, 255, 0.50)', // 편집 버튼 테두리
    pink20: 'rgba(251, 100, 182, 0.20)',   // 내 말풍선 그라디언트 끝색
    pink30: 'rgba(251, 100, 182, 0.30)',   // 목소리 녹음 카드 테두리
    red20: 'rgba(255, 100, 103, 0.20)',    // 목소리 녹음 카드 그라디언트 끝색
    blue20: 'rgba(81, 162, 255, 0.20)',    // 얼굴 스캔 카드 그라디언트 끝색
    gold20: 'rgba(253, 199, 0, 0.20)',     // "NEW" 배지 배경
    gold40: 'rgba(253, 199, 0, 0.40)',     // "NEW" 배지 테두리
    recordingBg: ['rgba(0, 211, 243, 0.05)', 'rgba(194, 122, 255, 0.05)'] as [string, string], // 웨이브폼 배경
  }
};

/**
 * 둥근 모서리(BorderRadius) 수치 시스템
 * 프로젝트 전역의 모서리 곡률 일관성을 위해 사용합니다.
 */
export const Radii = {
  none: 0,
  xs: 4,
  sm: 8,
  bubble: 6, // 말풍선 origin 모서리 (진입 방향 표시용)
  smmd: 10,   // 통화 서브 정보 등 추가분
  md: 12,
  md2: 14,    // 버튼, 드롭다운, 카드 등 범용 (피그마 명칭 미정)
  lg: 16,     // 기본 입력창, 카드 등 (가장 많이 사용됨)
  lg2: 20,    // 카드, 섹션 컨테이너 (피그마 명칭 미정)
  xl: 24,
  xxl: 32,    // 대형 모달 (피그마 명칭 미정)
  full: 9999,  // Pill 형태 또는 완벽한 원형을 구현할 때 사용
} as const;

/**
 * 레이아웃 관련 상수 시스템
 */
export const Layout = {
  MAX_CONTENT_WIDTH: 345,
  SCREEN_PADDING: 24,
  MAIN_TAB_CONTENTS_BOTTOM_PADDING: 100, // BottomNavbar 높이에 대응하는 스크롤 하단 여백
} as const;


