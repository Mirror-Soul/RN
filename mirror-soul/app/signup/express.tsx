import SecurityFooter from '@/src/components/home/SecurityFooter';
import GradientButton from '@/src/components/common/GradientButton';
import Step3Header from '@/src/components/signup/steps/Step3_ExpressPersonal/components/Step3Header';
import SelfDescriptionInput from '@/src/components/signup/steps/Step3_ExpressPersonal/Description/SelfDescriptionInput';
import MbtiSelector from '@/src/components/signup/steps/Step3_ExpressPersonal/Mbti/MbtiSelector';
import {Spacing} from '@/src/constants/theme';
import { useLayout } from '@/src/hooks/useLayout';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';

import { useStep3Form } from '@/src/components/signup/steps/Step3_ExpressPersonal/hooks/useStep3Form';

export default function ExpressYourselfScreen() {
  const router = useRouter();
  const { contentContainerStyle, screenPadding } = useLayout();
  const {
    mbti,
    setMbti,
    setScores, // 추가
    description,
    setDescription,
    isSubmitting,
    isFormValid,
    handleSubmit,
  } = useStep3Form();

  // MBTI 슬라이더 드래그 중에는 ScrollView 스크롤 비활성화
  const [isSliding, setIsSliding] = useState(false);

  const handleContinue = () => {
    handleSubmit(() => {
      router.push(SIGNUP_ROUTES.INTERVIEW);
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isSliding}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, contentContainerStyle, { paddingHorizontal: screenPadding }]}>
          {/* Header Section */}
          <Animated.View entering={FadeInDown.delay(0).duration(400).springify()} style={styles.headerWrapper}>
            <Step3Header />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.body}>
            <MbtiSelector
              onMbtiChange={setMbti}
              onScoresChange={setScores}
              onDragStart={() => setIsSliding(true)}
              onDragEnd={() => setIsSliding(false)}
            />

            <SelfDescriptionInput
              value={description}
              onChangeText={setDescription}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} style={styles.buttonWrapper}>
            <GradientButton
              title="Continue"
              onPress={handleContinue}
              disabled={!isFormValid || isSubmitting}
              style={styles.button}
              variant="full"
            />
          </Animated.View>
          <SecurityFooter />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 50,
  },
  container: {
    alignItems: 'center',
    marginTop: 25,
  },
  headerWrapper: {
    marginBottom: Spacing.giant, // 40px gap between header and content
  },
  body: {
    width: '100%',
    gap: Spacing.giant,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: Spacing.giant,
  },
  button: {
    marginBottom: Spacing.xxl,
  }
});

