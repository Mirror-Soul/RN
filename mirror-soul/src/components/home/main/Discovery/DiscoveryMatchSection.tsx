import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import DiscoveryMatchCard, { SoulMatch } from './DiscoveryMatchCard';

// Mock 데이터 — 추후 API 연동 시 교체
const SOUL_MATCHES: SoulMatch[] = [
  {
    id: '1',
    name: '서연',
    age: 28,
    location: '서울 강남구',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    job: 'UI/UX 디자이너',
    isJobVerified: true,
    mbti: 'INFJ',
    compatibility: 94,
    bio: '책과 음악을 사랑하는 크리에이티브 디렉터입니다. 모든 영혼은 저마다의 고유한 주파수를 가지고 있다고 믿어요.',
    voiceStyle: '차분하고 따뜻한 목소리',
    aiAnalysisTags: ['사고가 깊은', '차분한 말투', '예술적 감수성'],
    interests: [{ label: '필름 사진' }, { label: '재즈 음악' }, { label: '핸드드립' }],
  },
  {
    id: '2',
    name: '지우',
    age: 26,
    location: '서울 마포구',
    profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    job: '개발자',
    isJobVerified: false,
    mbti: 'ENFP',
    compatibility: 89,
    bio: 'UX 디자이너로 일하며 사람들의 경험을 연구합니다. 요가와 명상으로 하루를 시작하는 것을 좋아해요.',
    voiceStyle: '밝고 쾌활한 목소리',
    aiAnalysisTags: ['외향적인', '공감 능력이 높은', '에너지 넘치는'],
    interests: [{ label: '사진' }, { label: '라떼 아트' }],
  },
];

interface DiscoveryMatchSectionProps {
  onPass?: (id: string) => void;
  onConnect?: (id: string) => void;
  onOpenDetail?: (match: SoulMatch) => void;
}

/**
 * DiscoveryMatchSection 컴포넌트 (SRP)
 * 히어로 카드의 현재 인덱스 상태와 전환 애니메이션만 담당하는 오케스트레이터입니다.
 * 상세 모달의 열림 상태는 부모(index.tsx)가 소유합니다.
 */
export default function DiscoveryMatchSection({ onPass, onConnect, onOpenDetail }: DiscoveryMatchSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMatch = SOUL_MATCHES[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SOUL_MATCHES.length);
  };

  return (
    <View style={styles.container}>
      <Animated.View key={currentMatch.id} entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
        <DiscoveryMatchCard
          match={currentMatch}
          onPass={(id) => {
            onPass?.(id);
            goToNext();
          }}
          onConnect={onConnect}
          onOpenDetail={onOpenDetail}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
});
