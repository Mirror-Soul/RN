import SecurityFooter from '@/src/components/home/SecurityFooter';
import PrimaryButton from '@/src/components/signup/common/PrimaryButton';
import Step3Header from '@/src/components/signup/steps/Step3_ExpressPersonal/components/Step3Header';
import SelfDescriptionInput from '@/src/components/signup/steps/Step3_ExpressPersonal/Description/SelfDescriptionInput';
import MbtiSelector from '@/src/components/signup/steps/Step3_ExpressPersonal/Mbti/MbtiSelector';
import { Layout } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';

export default function ExpressYourselfScreen() {
  const router = useRouter();
  const [mbti, setMbti] = useState('ENFJ');
  const [description, setDescription] = useState('');
  // MBTI 슬라이더 드래그 중에는 ScrollView 스크롤 비활성화
  const [isSliding, setIsSliding] = useState(false);

  // 모든 MBTI가 선택되었고(하이픈 없음), 자기소개가 비어있지 않을 때만 활성화
  const isFormValid = !mbti.includes('-') && description.trim().length > 0;

  const handleContinue = () => {
    router.push(SIGNUP_ROUTES.INTERVIEW);
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
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.headerWrapper}>
            <Step3Header />
          </View>

          <View style={styles.body}>
            <MbtiSelector
              onMbtiChange={setMbti}
              onDragStart={() => setIsSliding(true)}
              onDragEnd={() => setIsSliding(false)}
            />

            <SelfDescriptionInput
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.buttonWrapper}>
            <PrimaryButton
              title="Continue"
              onPress={handleContinue}
              disabled={!isFormValid}
              style={styles.button}
            />
          </View>
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
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignItems: 'center',
    marginTop: 25,
  },
  headerWrapper: {
    marginBottom: 40, // 40px gap between header and content
  },
  body: {
    width: '100%',
    gap: 40,
  },
  buttonWrapper: {
    width: '100%',
    marginTop: 40,
  },
  button: {
    marginBottom: 24,
  }
});

