import EvolveBodyTitle from '@/src/components/home/grow/EvolveBodyTitle';
import EvolveFooter from '@/src/components/home/grow/EvolveFooter';
import EvolveHeader from '@/src/components/home/grow/EvolveHeader';
import EmotionMissionCard from '@/src/components/home/grow/EmotionMissionCard';
import FaceDataMissionCard from '@/src/components/home/grow/FaceDataMissionCard';
import GrowthHeroSection from '@/src/components/home/grow/GrowthHeroSection';
import TwinSimulationCard from '@/src/components/home/grow/TwinSimulationCard';
import ValueBalanceMissionCard from '@/src/components/home/grow/ValueBalanceMissionCard';
import VoiceMissionCard from '@/src/components/home/grow/VoiceMissionCard';
import EmotionLogModal from '@/src/components/home/grow/modals/EmotionLogModal';
import ValueBalanceModal from '@/src/components/home/grow/modals/ValueBalanceModal';
import VerificationModal from '@/src/components/home/grow/modals/VerificationModal';
import { Layout, Spacing } from '@/src/constants/theme';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장(Growth) 탭 화면
 * 내 트윈의 유사도를 높이기 위한 미션들을 관리합니다.
 *
 * 모달 상태(프로필 인증 / 가치관 밸런스 게임 / 감정 기록)와 유사도 % 누적은
 * 이 화면이 소유하고, 하위 카드/섹션 컴포넌트들은 콜백을 통해서만 상태 변경을
 * 요청합니다 (SRP).
 */
export default function GrowScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();

  // Mock 데이터 (추후 API 연동)
  const [similarityPercent, setSimilarityPercent] = useState(92.4);
  const [isVerified, setIsVerified] = useState(false);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showEmotionModal, setShowEmotionModal] = useState(false);

  const handleBoost = useCallback((boost: number) => {
    setSimilarityPercent((prev) => parseFloat(Math.min(100, prev + boost).toFixed(1)));
  }, []);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING) }]}>
        <EvolveHeader />

        <GrowthHeroSection
          similarityPercent={similarityPercent}
          isVerified={isVerified}
          onVerifyPress={() => setShowVerifyModal(true)}
        />

        <TwinSimulationCard />

        <View style={styles.missionSection}>
          <EvolveBodyTitle />

          <View style={styles.missionGrid}>
            <View style={styles.row}>
              <FaceDataMissionCard />
              <EmotionMissionCard onPress={() => setShowEmotionModal(true)} />
            </View>

            <ValueBalanceMissionCard onPress={() => setShowBalanceModal(true)} />

            <VoiceMissionCard />
          </View>
        </View>

        <EvolveFooter />
      </View>

      <VerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerified={() => setIsVerified(true)}
      />

      <ValueBalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        onComplete={() => handleBoost(1.2)}
      />

      <EmotionLogModal
        isOpen={showEmotionModal}
        onClose={() => setShowEmotionModal(false)}
        onComplete={() => handleBoost(0.2)}
      />
    </ScrollView>
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
    gap: Spacing.xxxl,
    paddingHorizontal: Spacing.xs,
  },
  missionSection: {
    gap: Spacing.xl,
    alignSelf: 'stretch',
  },
  missionGrid: {
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
});
