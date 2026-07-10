import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CustomerCenterHeader } from './components/CustomerCenterHeader';
import { FaqAccordion } from './components/FaqAccordion';
import { EmailContactButton } from './components/EmailContactButton';

export const CustomerCenterScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <CustomerCenterHeader />

        {/* 서브타이틀 */}
        <Animated.View
          entering={FadeInDown.delay(80).duration(500).springify()}
          style={styles.subtitleContainer}
        >
          <Text style={styles.subtitleMain}>무엇을 도와드릴까요?</Text>
          <Text style={styles.subtitleSub}>편하게 물어보세요.</Text>
        </Animated.View>

        {/* FAQ 아코디언 카드 */}
        <Animated.View
          entering={FadeInDown.delay(160).duration(550).springify()}
          style={styles.faqSection}
        >
          <FaqAccordion />
        </Animated.View>

        {/* 이메일 문의 섹션 */}
        <Animated.View
          entering={FadeInDown.delay(240).duration(550).springify()}
          style={styles.emailSection}
        >
          <EmailContactButton />
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
    color: '#FFFFFF',
  },
  subtitleSub: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#99A1AF',
    marginTop: 4,
  },
  faqSection: {
    width: '100%',
  },
  emailSection: {
    width: '100%',
  },
});
