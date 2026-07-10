import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CustomerCenterHeader } from './components/CustomerCenterHeader';
import { FaqAccordion } from './components/FaqAccordion';
import { EmailContactButton } from './components/EmailContactButton';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export const CustomerCenterScreen = () => {
  const insets = useSafeAreaInsets();
  const { animatedBackground, animatedText, animatedTextMuted } = useAnimatedTheme();

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <CustomerCenterHeader />

        <Animated.View
          entering={FadeInDown.delay(80).duration(500).springify()}
          style={styles.subtitleContainer}
        >
          <Animated.Text style={[styles.subtitleMain, animatedText]}>무엇을 도와드릴까요?</Animated.Text>
          <Animated.Text style={[styles.subtitleSub, animatedTextMuted]}>편하게 물어보세요.</Animated.Text>
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
