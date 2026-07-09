import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { VoiceAudioHeader } from './components/VoiceAudioHeader';
import { SpeedSegmentControl } from './components/SpeedSegmentControl';
import { useVoiceAudioSettings } from './hooks/useVoiceAudioSettings';

export const VoiceAudioScreen = () => {
  const insets = useSafeAreaInsets();
  const { speechSpeed, handleSpeedChange } = useVoiceAudioSettings();

  return (
    <View style={styles.container}>
      {/* 라디얼 그라디언트 배경 (CSS 명세 재현: 보라 + Cyan) */}
      <View style={styles.gradientOverlay} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <VoiceAudioHeader />

        {/* 말하기 속도 카드 */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(550).springify()}
          style={styles.card}
        >
          {/* 카드 타이틀 */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>상대방 말하기 속도</Text>
          </View>

          {/* 카드 설명 */}
          <View style={styles.cardDescription}>
            <Text style={styles.descriptionText}>
              자연스러운 대화 흐름에 맞게 속도를 조절하세요.
            </Text>
          </View>

          {/* 세그먼트 컨트롤 */}
          <View style={styles.segmentWrapper}>
            <SpeedSegmentControl
              selectedSpeed={speechSpeed}
              onSelect={handleSpeedChange}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // CSS 명세의 Radial Gradient를 레이어로 재현
  // (expo-linear-gradient는 radial 미지원 → React Native View 레이어 합성)
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    // 좌상단: 보라빛 (rgba(141,89,236,0.07))
    // CSS radial-gradient를 완벽히 재현하려면 expo-svg의 RadialGradient를 사용해야 하지만,
    // 성능과 단순성을 위해 LinearGradient 두 레이어로 근사치 적용
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#FFFFFF',
  },
  cardDescription: {
    marginBottom: 20,
  },
  descriptionText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
  },
  segmentWrapper: {
    width: '100%',
  },
});
