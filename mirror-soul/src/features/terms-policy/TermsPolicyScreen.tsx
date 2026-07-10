import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PolicyMenuItem } from './components/PolicyMenuItem';
import { TERMS_LINKS } from './constants/termsLinks';

export const TermsPolicyScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* 백그라운드 (CSS 명세 기반 근사치 그라데이션) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* React Native에서 복잡한 다중 Radial Gradient를 위해 SVG를 사용하거나 단순화합니다. 여기서는 단순화. */}
        <View style={styles.gradientOverlay} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Animated.View 
          entering={FadeInDown.delay(0).duration(500).springify()}
          style={styles.header}
        >
          <Pressable onPress={() => router.navigate('/(main)/profile')} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>약관 및 정책</Text>
          {/* 타이틀 중앙 정렬용 여백 */}
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* 메뉴 리스트 컨테이너 (Glassmorphism) */}
        <Animated.View 
          entering={FadeInDown.delay(120).duration(550).springify()}
          style={styles.menuContainer}
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

        {/* 하단 안내 텍스트 */}
        <Animated.View 
          entering={FadeInDown.delay(240).duration(550).springify()}
          style={styles.footerTextContainer}
        >
          <Text style={styles.footerText}>각 항목을 누르면 외부 브라우저에서 열립니다.</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: -0.44,
  },
  menuContainer: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.61,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#4A5565',
    textAlign: 'center',
  },
});
