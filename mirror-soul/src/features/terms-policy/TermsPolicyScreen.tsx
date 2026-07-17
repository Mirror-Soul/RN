import React from 'react';
import { FontFamily } from '@/src/constants/theme';

import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PolicyMenuItem } from './components/PolicyMenuItem';
import { TERMS_LINKS } from './constants/termsLinks';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

export const TermsPolicyScreen = () => {
  const { colors } = useThemeColors();

  return (
    <ScreenLayout withScroll={true}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.gradientOverlay} />
      </View>

      <Header title="약관 및 정책" delay={0} />

      <Animated.View 
        entering={FadeInDown.delay(120).duration(550).springify()}
        style={[styles.menuContainer, { backgroundColor: colors.background.glass, borderColor: colors.border.primary }]}
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
        <Animated.Text style={[styles.footerText, { color: colors.text.muted }]}>각 항목을 누르면 외부 브라우저에서 열립니다.</Animated.Text>
      </Animated.View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', 
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
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
  },
});

