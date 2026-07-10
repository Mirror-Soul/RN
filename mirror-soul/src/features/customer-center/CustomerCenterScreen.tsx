import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FaqAccordion } from './components/FaqAccordion';
import { EmailContactButton } from './components/EmailContactButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

export const CustomerCenterScreen = () => {
  const { colors } = useThemeColors();

  return (
    <ScreenLayout withScroll={true}>
      <Header title="고객센터" delay={0} />

      <View style={styles.contentPadding}>
        <Animated.View
          entering={FadeInDown.delay(80).duration(500).springify()}
          style={styles.subtitleContainer}
        >
          <Animated.Text style={[styles.subtitleMain, { color: colors.text.primary }]}>무엇을 도와드릴까요?</Animated.Text>
          <Animated.Text style={[styles.subtitleSub, { color: colors.text.muted }]}>편하게 물어보세요.</Animated.Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(160).duration(550).springify()}
          style={styles.faqSection}
        >
          <FaqAccordion />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(240).duration(550).springify()}
          style={styles.emailSection}
        >
          <EmailContactButton />
        </Animated.View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  contentPadding: {
    paddingHorizontal: 24,
  },
  subtitleContainer: {
    width: '100%',
    marginBottom: 32,
  },
  subtitleMain: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.45,
  },
  subtitleSub: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    marginTop: 4,
  },
  faqSection: {
    width: '100%',
  },
  emailSection: {
    width: '100%',
  },
});
