import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { VoiceAudioHeader } from './components/VoiceAudioHeader';
import { SpeedSegmentControl } from './components/SpeedSegmentControl';
import { useVoiceAudioSettings } from './hooks/useVoiceAudioSettings';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export const VoiceAudioScreen = () => {
  const insets = useSafeAreaInsets();
  const { speechSpeed, handleSpeedChange } = useVoiceAudioSettings();
  const { animatedBackground, animatedGlassBackground, animatedText, animatedTextMuted } = useAnimatedTheme();

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <VoiceAudioHeader />

        <Animated.View
          entering={FadeInDown.delay(120).duration(550).springify()}
          style={[styles.card, animatedGlassBackground]}
        >
          <View style={styles.cardHeader}>
            <Animated.Text style={[styles.cardTitle, animatedText]}>상대방 말하기 속도</Animated.Text>
          </View>

          <View style={styles.cardDescription}>
            <Animated.Text style={[styles.descriptionText, animatedTextMuted]}>
              자연스러운 대화 흐름에 맞게 속도를 조절하세요.
            </Animated.Text>
          </View>

          <View style={styles.segmentWrapper}>
            <SpeedSegmentControl
              selectedSpeed={speechSpeed}
              onSelect={handleSpeedChange}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  card: {
    borderWidth: 0.61,
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
  },
  cardDescription: {
    marginBottom: 20,
  },
  descriptionText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  segmentWrapper: {
    width: '100%',
  },
});
