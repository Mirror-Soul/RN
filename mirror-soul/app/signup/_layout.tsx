import OnboardingSteps from '@/src/components/signup/common/OnboardingSteps';
import SignupBackground from '@/src/components/signup/steps/Step1_Account/SignupBackground';
import { SIGNUP_STEP_MAP } from '@/src/constants/routes/signupRoutes';
import {Colors, Spacing} from '@/src/constants/theme';
import { Slot, usePathname } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

export default function SignupLayout() {
  const pathname = usePathname();

  const getCurrentStep = () => {
    return SIGNUP_STEP_MAP[pathname] || 1;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.soulBlack} />
      <SignupBackground />

      <View style={styles.container}>
        <View style={styles.stepsWrapper}>
          <OnboardingSteps currentStep={getCurrentStep()} />
        </View>

        {/* 하위 페이지(index, profile 등)가 렌더링될 영역 */}
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    width: '100%', // 명시적으로 너비 부여
  },
  stepsWrapper: {
    width: '100%',
    alignItems: 'center', // 내부 OnboardingSteps를 위해 센터링 유지
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.sm,
    zIndex: 10,
  },
});
