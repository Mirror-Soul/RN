import { Feather } from '@expo/vector-icons';
import { FontFamily, FontSize, FontWeight, Radii, Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
    mbtiAxisScores: { E: 28, S: 35, T: 30, J: 75 },
    compatibility: 94,
    cloneSummary: '조용히 곁을 지키는 타입이에요. 깊이 있는 대화를 나눌수록 매력이 드러나요.',
    bio: '책과 음악을 사랑하는 크리에이티브 디렉터입니다. 모든 영혼은 저마다의 고유한 주파수를 가지고 있다고 믿어요.',
    voiceStyle: '차분하고 따뜻한 목소리',
    aiAnalysisTags: ['사고가 깊은', '차분한 말투', '예술적 감수성'],
    valueTendencies: [
      { axisLabel: '라이프스타일', description: '집에서 여유롭게 쉬는 걸 좋아해요' },
      { axisLabel: '커뮤니케이션', description: '돌려 말하기보다 솔직하게 표현해요' },
      { axisLabel: '연애관', description: '애정표현은 행동으로 은근하게' },
    ],
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
    mbtiAxisScores: { E: 78, S: 25, T: 20, J: 22 },
    compatibility: 89,
    cloneSummary: '먼저 다가가는 걸 두려워하지 않아요. 함께 있으면 에너지가 전염되는 타입이에요.',
    bio: 'UX 디자이너로 일하며 사람들의 경험을 연구합니다. 요가와 명상으로 하루를 시작하는 것을 좋아해요.',
    voiceStyle: '밝고 쾌활한 목소리',
    aiAnalysisTags: ['외향적인', '공감 능력이 높은', '에너지 넘치는'],
    valueTendencies: [
      { axisLabel: '라이프스타일', description: '즉흥적으로 밖에 나가야 힘이 나요' },
      { axisLabel: '의사결정', description: '고민하기보다 일단 부딪혀보는 편' },
      { axisLabel: '사교 성향', description: '새로운 사람 만나는 걸 즐겨요' },
    ],
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
  const { colors } = useThemeColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMatch = SOUL_MATCHES[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SOUL_MATCHES.length);
  };

  // 추천 대상이 없는 경우(현재는 목업이라 항상 존재하지만, 추후 실제 API 연동 시
  // 빈 배열이 실제로 올 수 있다) — 방어하지 않으면 SOUL_MATCHES[currentIndex]가
  // undefined가 되어 DiscoveryMatchCard가 match.name에 접근하면서 크래시난다.
  if (!currentMatch) {
    return (
      <View
        style={[styles.emptyState, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
      >
        <Feather name="users" size={28} color={colors.text.muted} />
        <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>추천할 상대가 아직 없어요</Text>
        <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
          탐색 지역을 넓혀보거나 잠시 후 다시 확인해주세요.
        </Text>
      </View>
    );
  }

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
  emptyState: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: Radii.xxl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  emptySubtitle: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
});
