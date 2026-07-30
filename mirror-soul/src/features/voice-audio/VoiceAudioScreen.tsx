import React from 'react';
import {FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';

import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SpeedSegmentControl } from './components/SpeedSegmentControl';
import { useVoiceAudioSettings } from './hooks/useVoiceAudioSettings';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

export const VoiceAudioScreen = () => {
  const { speechSpeed, handleSpeedChange, isLoading } = useVoiceAudioSettings();
  const { colors } = useThemeColors();

  return (
    <ScreenLayout withScroll={true}>
      <Header title="음성/오디오 설정" delay={0} />

      <View style={styles.contentPadding}>
        <Animated.View
          entering={FadeInDown.delay(120).duration(550).springify()}
          style={[styles.card, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
        >
          <View style={styles.cardHeader}>
            <Animated.Text style={[styles.cardTitle, { color: colors.text.primary }]}>상대방 말하기 속도</Animated.Text>
          </View>

          <View style={styles.cardDescription}>
            <Animated.Text style={[styles.descriptionText, { color: colors.text.muted }]}>
              자연스러운 대화 흐름에 맞게 속도를 조절하세요.
            </Animated.Text>
          </View>

          <View style={styles.segmentWrapper}>
            <SpeedSegmentControl
              selectedSpeed={speechSpeed}
              onSelect={handleSpeedChange}
              disabled={isLoading}
            />
          </View>
        </Animated.View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  contentPadding: {
    paddingHorizontal: Spacing.xxl,
  },
  card: {
    borderWidth: 0.61,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  cardTitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.base,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  cardDescription: {
    marginBottom: Spacing.xl,
  },
  descriptionText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
  segmentWrapper: {
    width: '100%',
  },
});
