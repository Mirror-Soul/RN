import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PolicyMenuItem } from './components/PolicyMenuItem';
import { TERMS_LINKS } from './constants/termsLinks';
import { useAnimatedTheme } from '@/src/hooks/useAnimatedTheme';

export const TermsPolicyScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, animatedBackground, animatedGlassBackground, animatedBorder, animatedText, animatedTextMuted } = useAnimatedTheme();

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.gradientOverlay} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.delay(0).duration(500).springify()}
          style={styles.header}
        >
          <Pressable onPress={() => router.navigate('/(main)/profile')}>
            <Animated.View style={[styles.backButton, animatedGlassBackground, animatedBorder]}>
              <Feather name="arrow-left" size={20} color={colors.text.primary} />
            </Animated.View>
          </Pressable>
          <Animated.Text style={[styles.headerTitle, animatedText]}>약관 및 정책</Animated.Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(120).duration(550).springify()}
          style={[styles.menuContainer, animatedGlassBackground, animatedBorder]}
        >
          <PolicyMenuItem
            title="서비스 이용약관"
            iconColor="#00D3F2"
            iconBgColor="rgba(0, 211, 243, 0.1)"
            url={TERMS_LINKS.TERMS_OF_SERVICE}
          />
          <PolicyMenuItem
            title="개인정보 처리방침"
            iconColor="#C27AFF"
            iconBgColor="rgba(194, 122, 255, 0.1)"
            url={TERMS_LINKS.PRIVACY_POLICY}
          />
          <PolicyMenuItem
            title="오픈소스 라이선스"
            iconColor="#99A1AF"
            iconBgColor="rgba(153, 161, 175, 0.1)"
            url={TERMS_LINKS.OPEN_SOURCE_LICENSES}
            isLast={true}
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(240).duration(550).springify()}
          style={styles.footerTextContainer}
        >
          <Animated.Text style={[styles.footerText, animatedTextMuted]}>각 항목을 누르면 외부 브라우저에서 열립니다.</Animated.Text>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', 
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.61,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 18,
    letterSpacing: -0.44,
  },
  menuContainer: {
    marginHorizontal: 24,
    borderWidth: 0.61,
    borderRadius: 16,
    overflow: 'hidden',
  },
  footerTextContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
  },
});
