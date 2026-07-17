import { TextStyle, ViewStyle } from 'react-native';

export const Colors = {
  primary: {
    electricCyan: '#00D3F3', // Brand Cyan
    vividPurple: '#C27AFF', // Brand Purple
    soulBlack: '#000000',
    successGreen: '#05DF72', // Verification Success Green
    recordingRed: '#FB2C36', // 녹음 중 버튼 및 포인트 컬러
    activeRedText: '#FF6467', // "실시간 음성 인식 중" 텍스트 컬러
    goldText: '#FFDF20',      // "NEW" 배지 텍스트 컬러
    mirrorOrange: '#FF8904',  // 매칭 포인트 오렌지
  },
  gradient: {
    cyanToPurple: ['#00D3F3', '#C27AFF'] as [string, string],
    voiceStart: ['#F6339A', '#AD46FF'] as [string, string],
    recording: ['#FB2C36', '#E7000B'] as [string, string],
    done: ['#00C950', '#00BC7D'] as [string, string],
    cyanBluePurple: ['#00D3F3', '#51A2FF', '#C27AFF'] as [string, string, string], // 녹음 버튼용
    matchingActive: ['rgba(251, 100, 182, 0.20)', 'rgba(194, 122, 255, 0.20)'] as [string, string], // 매칭 활성 배너
    meetProgress: ['#FF8904', '#FF6467'] as [string, string], // 만족도 바 및 통화 버튼
    cardHeader: ['rgba(255, 137, 4, 0.10)', 'rgba(255, 100, 103, 0.10)'] as [string, string], // 매칭 카드 헤더
    matchingStart: ['#FB64B6', '#C27AFF'] as [string, string], // 시작 버튼 전용
    twinCardHeader: ['rgba(0, 211, 243, 0.10)', 'rgba(81, 162, 255, 0.10)'] as [string, string], // Twin 카드 헤더 (시안)
    twinCallButton: ['#00D3F3', '#155DFC'] as [string, string], // 상대 Twin과 통화 버튼
    avatarPlaceholder: ['rgba(0, 211, 243, 0.2)', 'rgba(21, 93, 252, 0.2)'] as [string, string], // 매칭 카드 아바타 배경
    twinProgress: ['#00D3F3', '#51A2FF'] as [string, string], // Twin 만족도 바 그라디언트
    limeGradient: ['#65F56D', '#2BEE34'] as [string, string], // Lime Green 시작 버튼용
    subtleLimeGradient: ['rgba(43, 238, 52, 0.6)', 'rgba(43, 238, 52, 0.3)'] as [string, string], // 은은한 Lime Green (토글용)
  },
  neutral: {
    pureWhite: '#FFFFFF',
    softWhite: '#E5E7EB',
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
    cyan10_d3: 'rgba(0, 211, 243, 0.10)', // #00D3F3 기반
    cyan20_d3: 'rgba(0, 211, 243, 0.20)', // #00D3F3 기반
    cyan30_d3: 'rgba(0, 211, 243, 0.30)', // #00D3F3 기반
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
    black40: 'rgba(0, 0, 0, 0.40)', // 답변 박스 배경
    black50: 'rgba(0, 0, 0, 0.50)', // 추천 카드 배지 배경
    black80: 'rgba(0, 0, 0, 0.80)', // 추천 카드 정보 그라디언트
    purple10: 'rgba(194, 122, 255, 0.10)', // 통화 상세 알림 배너 배경
    purple50: 'rgba(194, 122, 255, 0.50)', // 편집 버튼 테두리
    pink20: 'rgba(251, 100, 182, 0.20)',   // 내 말풍선 그라디언트 끝색
    pink30: 'rgba(251, 100, 182, 0.30)',   // 목소리 녹음 카드 테두리
    red20: 'rgba(255, 100, 103, 0.20)',    // 목소리 녹음 카드 그라디언트 끝색
    red30: 'rgba(255, 100, 103, 0.30)',    // 매칭 카드 프로필 이미지 배경
    blue20: 'rgba(81, 162, 255, 0.20)',    // 얼굴 스캔 카드 그라디언트 끝색
    gold20: 'rgba(253, 199, 0, 0.20)',     // "NEW" 배지 배경
    gold40: 'rgba(253, 199, 0, 0.40)',     // "NEW" 배지 테두리
    orange10: 'rgba(255, 137, 4, 0.10)',   // 매칭 카드 배경
    orange20: 'rgba(255, 137, 4, 0.20)',   // 만남 신청 버튼 배경
    orange30: 'rgba(255, 137, 4, 0.30)',   // 만남 신청 버튼 테두리
    white05: 'rgba(255, 255, 255, 0.05)',  // 범용 글래스 배경
    white15: 'rgba(255, 255, 255, 0.15)',  // 범용 글래스 테두리
    recordingBg: ['rgba(0, 211, 243, 0.05)', 'rgba(194, 122, 255, 0.05)'] as [string, string], // 웨이브폼 배경
  },
  shadow: {
    voiceStart: {
      shadowColor: '#F6339A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 5,
    },
    recording: {
      shadowColor: '#FB2C36',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 5,
    },
    done: {
      shadowColor: '#00C950',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 5,
    },
  },
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

/**
 * 여백 및 간격 상수 시스템 (Spacing)
 */
export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  giant: 40,
  massive: 48,
} as const;


/**
 * 폰트 크기 상수 시스템 (Typography)
 */
export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  giant: 48,
} as const;

/**
 * 폰트 두께 상수 시스템 (Typography)
 */
export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

/**
 * 동적 테마 (Light/Dark Mode) 시스템
 */
export interface ThemeColors {
  background: {
    primary: string;   // 화면 최상단
    card: string;      // 카드, 모달 박스
    elevated: string;  // 바텀시트, 팝오버
    glass: string;     // 반투명 글래스
    overlay: string;   // 모달 오버레이 딤(dim) 배경
  };
  text: {
    primary: string;   // 주 텍스트
    secondary: string; // 서브 텍스트
    muted: string;     // 비활성, 플레이스홀더
    danger: string;    // 탈퇴, 에러 등 destructive 액션
  };
  brand: {
    accent: string;    // 주 액센트 (dark: limeGreen, light: cobaltBlue)
  };
  border: {
    primary: string;   // 카드, 구분선
    strong: string;    // 포커스, 강조 테두리
  };
  state: {
    danger: string;    // 에러, 탈퇴 등
    success: string;   // 완료, 확인
  };
  glow: {
    cyan: string;      // 매칭 배경 좌측
    purple: string;    // 매칭 배경 우측
    cyanInner: string; // 프로필 카드 내부
  };
}

export const lightTheme: ThemeColors = {
  background: {
    primary: '#F8F7F4',               // Off White
    card: '#FFFFFF',
    elevated: '#FFFFFF',              // 바텀시트, 팝오버
    glass: 'rgba(0, 0, 0, 0.05)',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  text: {
    primary: '#141414',
    secondary: '#4B5563',
    muted: '#9CA3AF',
    danger: '#DC2626',                // 라이트 모드 destructive
  },
  brand: {
    accent: '#0047FF',                // Electric Cobalt
  },
  border: {
    primary: 'rgba(0, 0, 0, 0.12)',
    strong: 'rgba(0, 0, 0, 0.30)',
  },
  state: {
    danger: '#DC2626',
    success: '#059669',
  },
  glow: {
    cyan: 'rgba(0, 211, 243, 0.02)',
    purple: 'rgba(194, 122, 255, 0.02)',
    cyanInner: 'rgba(0, 211, 243, 0.02)',
  },
};

export const darkTheme: ThemeColors = {
  background: {
    primary: '#141414',               // Pitch Black
    card: '#2A2A2A',
    elevated: '#323232',              // 바텀시트, 팝오버
    glass: Colors.glass.white5,
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DC',
    muted: '#6A7282',
    danger: '#FF4C4C',                // 다크 모드 destructive
  },
  brand: {
    accent: '#2BEE34',                // Lime Green
  },
  border: {
    primary: Colors.glass.white10,
    strong: 'rgba(255, 255, 255, 0.30)',
  },
  state: {
    danger: '#FF4C4C',
    success: '#05DF72',
  },
  glow: {
    cyan: 'rgba(82, 192, 240, 0.05)',
    purple: 'rgba(150, 123, 245, 0.05)',
    cyanInner: 'rgba(0, 211, 243, 0.05)',
  },
};

/**
 * 폰트 패밀리 상수
 * 프로젝트 전역에서 fontFamily 하드코딩 방지를 위해 사용합니다.
 */
export const FontFamily = {
  sans: 'Inter',   // UI 전반 (본문, 버튼, 레이블 등)
  mono: 'Menlo',   // 타이머, 코드, 인증 코드 등 고정 폭 텍스트
} as const;
