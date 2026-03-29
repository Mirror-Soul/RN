export const Colors = {
  primary: {
    electricCyan: '#00D3F3', // Brand Cyan
    vividPurple: '#C27AFF', // Brand Purple
    soulBlack: '#000000',
    successGreen: '#05DF72', // Verification Success Green
    recordingRed: '#FB2C36', // 녹음 중 버튼 및 포인트 컬러
    activeRedText: '#FF6467', // "실시간 음성 인식 중" 텍스트 컬러
  },
  gradient: {
    // Array format for expo-linear-gradient
    cyanToPurple: ['#00D3F3', '#C27AFF'] as [string, string],
    cyanBluePurple: ['#00D3F3', '#51A2FF', '#C27AFF'] as [string, string, string], // 녹음 버튼용
  },
  neutral: {
    pureWhite: '#FFFFFF',
    lightGray: '#99A1AF',
    darkGray: '#6A7282',
    disabledText: '#4A5565',
    lightGrayText: '#D1D5DC',
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
    black40: 'rgba(0, 0, 0, 0.40)', // 답변 박스 배경
    recordingBg: ['rgba(0, 211, 243, 0.05)', 'rgba(194, 122, 255, 0.05)'] as [string, string], // 웨이브폼 배경
  }
};
