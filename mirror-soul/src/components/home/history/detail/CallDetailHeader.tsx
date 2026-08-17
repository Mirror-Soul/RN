import React from 'react';
import { Header } from '@/src/components/common/Header';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import CallDetailHeaderLeft from './parts/CallDetailHeaderLeft';
import CallDetailHeaderRight from './parts/CallDetailHeaderRight';

interface CallDetailHeaderProps {
  name: string;
  profileImageUrl?: string | null;
  description: string;
  callNumber?: number | null;
  onBack: () => void;
  onCallPress: () => void;
  onMorePress: () => void;
}

/**
 * 통화 상세 헤더 — 공용 Header(src/components/common/Header.tsx)를 감싸는 얇은 wrapper.
 * message-room의 MessageRoomScreen과 동일한 조립 방식(leftContent/rightElement 슬롯)을 따른다.
 * 예전엔 이 컴포넌트가 헤더 전체를 처음부터 새로 그렸는데, 공용 Header가 이미 제공하는
 * safe-area 처리/뒤로가기 fallback/테마 대응/진입 애니메이션을 중복 구현하고 있었다.
 */
export default function CallDetailHeader({
  name,
  profileImageUrl,
  description,
  callNumber,
  onBack,
  onCallPress,
  onMorePress,
}: CallDetailHeaderProps) {
  const { colors } = useThemeColors();

  return (
    <Header
      leftContent={
        <CallDetailHeaderLeft
          name={name}
          profileImageUrl={profileImageUrl}
          description={description}
          callNumber={callNumber}
        />
      }
      rightElement={<CallDetailHeaderRight onCallPress={onCallPress} onMorePress={onMorePress} />}
      onBackPress={onBack}
      borderBottomColor={colors.border.primary}
    />
  );
}
