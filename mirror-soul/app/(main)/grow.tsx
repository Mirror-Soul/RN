import EvolveBodyTitle from '@/src/components/home/grow/EvolveBodyTitle';
import EvolveFooter from '@/src/components/home/grow/EvolveFooter';
import EvolveHeader from '@/src/components/home/grow/EvolveHeader';
import EvolveTwinCard from '@/src/components/home/grow/EvolveTwinCard';
import EvolveFaceScanCard from '@/src/components/home/grow/parts/EvolveFaceScanCard';
import EvolveInterviewCard from '@/src/components/home/grow/parts/EvolveInterviewCard';
import EvolveMyselfCard from '@/src/components/home/grow/parts/EvolveMyselfCard';
import EvolveVoiceCard from '@/src/components/home/grow/parts/EvolveVoiceCard';
import { Colors, Layout } from '@/src/constants/theme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAnimatedTheme from '@/src/hooks/useAnimatedTheme';

/**
 * 성장(Evolve) 탭 화면
 * 내 트윈의 완성도를 높이기 위한 미션들을 관리합니다.
 */
export default function GrowScreen() {
  const insets = useSafeAreaInsets();

  // Mock 데이터 (추후 API 연동)
  const mockProgress = {
    completionPercent: 92,
  };

  const { animatedBackground } = useAnimatedTheme();

  return (
    <Animated.ScrollView
      style={[styles.scrollView, animatedBackground]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING) }]}>
        <EvolveHeader />
        
        {/* 내 트윈 완성도 카드 */}
        <EvolveTwinCard 
          completionPercent={mockProgress.completionPercent}
        />

        {/* 성장 미션 섹션 */}
        <EvolveBodyTitle />
        
        <View style={styles.missionGrid}>
          {/* 인터뷰 (Full Width) */}
          <EvolveInterviewCard />
          
          {/* 얼굴 스캔 & 목소리 녹음 (Side by Side) */}
          <View style={styles.row}>
            <EvolveFaceScanCard />
            <EvolveVoiceCard />
          </View>

          {/* 내 트윈과 대화하기 (Full Width) */}
          <EvolveMyselfCard />
        </View>

        {/* 하단 푸터 안내 */}
        <EvolveFooter />
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: 16,
    paddingHorizontal: 4, // 양 끝 여유 공간
  },
  missionGrid: {
    gap: 12,
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
});
