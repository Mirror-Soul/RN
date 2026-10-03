import OnboardingSteps from '@/src/components/signup/common/OnboardingSteps';
import SignupBackground from '@/src/components/signup/steps/Step1_Account/SignupBackground';
import { SIGNUP_STEP_MAP } from '@/src/constants/routes/signupRoutes';
import { Spacing } from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useLayout } from '@/src/hooks/useLayout';
import { SignupLayoutContext } from '@/src/components/signup/common/SignupLayoutContext';
import { Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignupLayout() {
  const pathname = usePathname();
  const { colors, isDark } = useThemeColors();
  const { contentContainerStyle, screenPadding } = useLayout();
  const { top } = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);

  const getCurrentStep = () => {
    return SIGNUP_STEP_MAP[pathname] || 1;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background.primary} />
      <SignupBackground />

      <View style={styles.container}>
        <View onLayout={event => setHeaderHeight(event.nativeEvent.layout.height)} style={[styles.stepsWrapper, contentContainerStyle, { paddingHorizontal: screenPadding, borderBottomColor: colors.border.primary }]}>
          <OnboardingSteps currentStep={getCurrentStep()} />
        </View>

        {/* 하위 페이지(index, profile 등)가 렌더링될 영역 */}
        <SignupLayoutContext.Provider value={top + headerHeight}>
          <Slot />
        </SignupLayoutContext.Provider>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%', // 명시적으로 너비 부여
  },
  stepsWrapper: {
    width: '100%',
    alignItems: 'center', // 내부 OnboardingSteps를 위해 센터링 유지
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    zIndex: 10,
  },
});
