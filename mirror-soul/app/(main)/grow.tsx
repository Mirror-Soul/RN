import EvolveBodyTitle from '@/src/components/home/grow/EvolveBodyTitle';
import EvolveFooter from '@/src/components/home/grow/EvolveFooter';
import EvolveHeader from '@/src/components/home/grow/EvolveHeader';
import FaceDataMissionCard from '@/src/components/home/grow/FaceDataMissionCard';
import GrowthHeroSection from '@/src/components/home/grow/GrowthHeroSection';
import TwinSimulationCard from '@/src/components/home/grow/TwinSimulationCard';
import ValueBalanceMissionCard from '@/src/components/home/grow/ValueBalanceMissionCard';
import VoiceMissionCard from '@/src/components/home/grow/VoiceMissionCard';
import ValueBalanceModal from '@/src/components/home/grow/modals/ValueBalanceModal';
import VerificationModal from '@/src/components/home/grow/modals/VerificationModal';
import { Layout, Spacing } from '@/src/constants/theme';
import { useTwinSyncQuery } from '@/src/features/growth/hooks/useTwinSyncQuery';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 성장(Growth) 탭 화면
 * 내 트윈의 유사도를 높이기 위한 미션들을 관리합니다.
 *
 * 모달 상태(프로필 인증 / 가치관 밸런스 게임)와 유사도 % 누적은
 * 이 화면이 소유하고, 하위 카드/섹션 컴포넌트들은 콜백을 통해서만 상태 변경을
 * 요청합니다 (SRP).
 */
export default function GrowScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();

  const twinSyncQuery = useTwinSyncQuery();

  const [isVerified, setIsVerified] = useState(false); // Mock 상태 (프로필 인증 API 연동 전)

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + Layout.MAIN_TAB_CONTENTS_BOTTOM_PADDING },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.container, contentContainerStyle, { paddingTop: Math.max(insets.top + 12, Layout.SCREEN_PADDING), paddingHorizontal: screenPadding }]}>
        <EvolveHeader />

        <GrowthHeroSection
          similarityPercent={twinSyncQuery.data?.syncRate ?? null}
          isLoading={twinSyncQuery.isLoading}
          isError={twinSyncQuery.isError}
          onRetry={() => twinSyncQuery.refetch()}
          isVerified={isVerified}
          onVerifyPress={() => setShowVerifyModal(true)}
        />

        <TwinSimulationCard />

        <View style={styles.missionSection}>
          <EvolveBodyTitle />

          <View style={styles.missionGrid}>
            <FaceDataMissionCard />

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

      {/*
        ValueBalanceModal은 이제 /evolve/value-balance API와 완전히 연동됐다.
        헤드라인 유사도(twinSyncQuery)는 답변 제출 mutation이 성공할 때마다 자체적으로
        무효화해 서버 최신값을 다시 받아오므로, onComplete에서 로컬로 값을 조작할 필요가 없다.
      */}
      <ValueBalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        onComplete={() => {}}
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
    gap: Spacing.xxxl,
  },
  missionSection: {
    gap: Spacing.xl,
    alignSelf: 'stretch',
  },
  missionGrid: {
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
});
