import React, { useCallback, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeBackground from '@/src/components/home/HomeBackground';
import SecurityFooter from '@/src/components/home/SecurityFooter';
import AuthTabToggle from '@/src/components/login/AuthTabToggle';
import LoginHeader from '@/src/components/login/LoginHeader';
import LoginTabView from '@/src/features/auth/components/LoginTabView';
import SignupTabView from '@/src/features/auth/components/SignupTabView';
import { Layout } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

/**
 * 초기 진입 홈 화면 (Login / Signup)
 *
 * 구조:
 *   - HomeBackground: SVG 방사형 그라디언트 배경
 *   - LoginHeader: "Mirror Soul" 그라디언트 타이틀 + 부제
 *   - AuthTabToggle: 로그인 ↔ 회원가입 Pill 토글 (Reanimated Spring)
 *   - 탭 콘텐츠 영역: LoginTabView | SignupTabView (FadeIn 전환)
 *   - SecurityFooter: 보안 안내 문구
 *
 * 결정 사항:
 *   - 소셜 로그인(OAuth) 1차 MVP 제외 → SocialLoginSection 완전 제거
 */
export default function HomeScreen() {
  const { colors, isDark } = useThemeColors();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const handleTabChange = useCallback((tab: 'login' | 'signup') => {
    setActiveTab(tab);
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setActiveTab('login');
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.background.primary} 
      />
      <HomeBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <View style={styles.container}>
            {/* Header: 타이틀 & 부제 */}
            <LoginHeader />

            {/* Pill 토글: 로그인 / 회원가입 */}
            <View style={styles.tabWrapper}>
              <AuthTabToggle activeTab={activeTab} onTabChange={handleTabChange} />
            </View>

            {/* 탭 콘텐츠 영역
                key prop으로 탭 전환 시 컴포넌트 재마운트 → FadeIn 애니메이션 자동 트리거 */}
            <View style={styles.formArea}>
              {activeTab === 'login' ? (
                <LoginTabView key="login" />
              ) : (
                <SignupTabView key="signup" onLoginTabPress={handleSwitchToLogin} />
              )}
            </View>

            {/* Footer */}
            <SecurityFooter />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  container: {
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 28,
    zIndex: 1,
  },
  tabWrapper: {
    width: '100%',
  },
  formArea: {
    width: '100%',
  },
});
