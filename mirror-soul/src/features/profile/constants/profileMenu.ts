import { ProfileSection } from '../types';
import { Colors } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export const useProfileSections = (): ProfileSection[] => {
  const { colors } = useThemeColors();

  return [
  {
    id: 'service_settings',
    title: '서비스 설정',
    items: [
      {
        id: 'account_management',
        label: '계정 관리',
        description: '닉네임, 로그아웃 등',
        iconName: 'user',
        iconColor: colors.text.primary,
        iconBgColor: colors.background.glass,
      },
      {
        id: 'voice_audio',
        label: '음성 및 오디오',
        description: 'AI 통화 품질 · 마이크 설정',
        iconName: 'mic', // Feather icon equivalent
        iconColor: '#00D3F2',
        iconBgColor: 'rgba(0, 211, 243, 0.1)',
      },
      {
        id: 'notifications',
        label: '알림 설정',
        description: '푸시 알림 수신 설정',
        iconName: 'bell',
        iconColor: Colors.primary.vividPurple,
        iconBgColor: 'rgba(194, 122, 255, 0.1)',
      },
    ],
  },
  {
    id: 'info_support',
    title: '정보 및 지원',
    items: [
      {
        id: 'customer_center',
        label: '고객 센터',
        description: '이메일 문의 연동',
        iconName: 'headphones',
        iconColor: '#FB64B6',
        iconBgColor: 'rgba(251, 100, 182, 0.1)',
      },
      {
        id: 'terms_policies',
        label: '약관 및 정책',
        description: undefined,
        iconName: 'file-text',
        iconColor: colors.text.muted,
        iconBgColor: colors.background.glass,
      },
    ],
  },
  ];
};
