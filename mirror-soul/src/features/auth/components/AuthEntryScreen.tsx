import React, { useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Spacing } from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useKeyboardVisible } from '@/src/hooks/useKeyboardVisible';
import { useAuthStore } from '@/src/store/useAuthStore';
import LoginHeader from '@/src/components/login/LoginHeader';
import { getAuthEntryEmail } from '../onboardingResume';
import LoginTabView from './LoginTabView';

/** Login is immediately available, without a tab switch or intro gate. */
export default function AuthEntryScreen() {
  const router = useRouter();
  const { email, notice } = useLocalSearchParams<{ email?: string; notice?: string }>();
  const initialEmail = getAuthEntryEmail(email);
  const hasInterruptedSignup = useAuthStore(state => state.hasInterruptedSignup);
  const { colors, isDark } = useThemeColors();
  const { contentContainerStyle, screenPadding, windowHeight, windowWidth } = useLayout();
  const { fontScale } = useWindowDimensions();
  const keyboardVisible = useKeyboardVisible();
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  // Android <= 10 may not send keyboard events with adjustResize. The measured
  // viewport still shrinks; keep the form usable in that case and in split view.
  const compact = keyboardVisible || (viewportHeight ?? windowHeight) < 480 || fontScale >= 1.6;
  return <SafeAreaView style={[styles.screen, { backgroundColor: colors.background.primary }]}>
    <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* iOS adjusts its scroll inset; Android already resizes its native window. */}
      <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled"
        automaticallyAdjustContentInsets={false} automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} showsVerticalScrollIndicator={false}
        onLayout={({ nativeEvent: { layout } }) => setViewportHeight(layout.height)}
        contentContainerStyle={[styles.scroll, compact && styles.keyboardScroll]}>
        <View style={[contentContainerStyle, styles.content, { paddingHorizontal: screenPadding }]}>
          <LoginHeader compact={compact} small={(viewportHeight ?? windowHeight) < 740 || windowWidth < 360} />
          <LoginTabView key={`${initialEmail}:${notice ?? ''}`} initialEmail={initialEmail}
            notice={typeof notice === 'string' ? notice : undefined} hasInterruptedSignup={hasInterruptedSignup}
            onSignup={email => { Keyboard.dismiss(); router.push({ pathname: '/signup', params: { email } }); }} />
        </View>
      </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: Spacing.xl },
  keyboardScroll: { justifyContent: 'flex-start', paddingVertical: Spacing.md },
  content: { gap: Spacing.xl },
});
