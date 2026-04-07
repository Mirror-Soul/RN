import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import HomeBackground from '@/src/components/home/HomeBackground';
import SecurityFooter from '@/src/components/home/SecurityFooter';
import SocialLoginSection from '@/src/components/home/SocialLoginSection';
import AuthForm from '@/src/components/login/AuthForm';
import AuthTabToggle from '@/src/components/login/AuthTabToggle';
import LoginHeader from '@/src/components/login/LoginHeader';
import { Layout } from '@/src/constants/theme';

/**
 * 초기 진입 홈 화면 (Home / Login)
 * 새로운 디자인 가이드에 맞춰 로그인/회원가입 폼 중심의 화면으로 개편.
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <HomeBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.container}>
              {/* Header: Title & Subtitle */}
              <LoginHeader />

              {/* Tab Selector: Login / Signup */}
              <View style={styles.tabWrapper}>
                <AuthTabToggle activeTab={activeTab} onTabChange={setActiveTab} />
              </View>

              {/* Dynamic Auth Form */}
              <AuthForm activeTab={activeTab} />

              {/* Social Login Section */}
              <View style={styles.socialContainer}>
                <SocialLoginSection />
              </View>

              {/* Footer */}
              <SecurityFooter />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
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
    minHeight: 595.57,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 32, // Overall section spacing
    zIndex: 1,
  },

  tabWrapper: {
    marginTop: 8,
  },
  socialContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
    marginTop: 16,
  }
});

