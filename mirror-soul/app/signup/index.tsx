import SecurityFooter from '@/src/components/home/SecurityFooter';
import SignupHeader from '@/src/components/signup/steps/Step1_Account/SignupHeader';
import TermsCheckbox from '@/src/components/signup/steps/Step1_Account/TermsCheckbox';
import CustomInput from '@/src/components/signup/common/CustomInput';
import PrimaryButton from '@/src/components/signup/common/PrimaryButton';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { SIGNUP_ROUTES } from '@/src/constants/routes/signupRoutes';

export default function AccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 모든 폼이 입력되었는지 검사하여 버튼 활성화 여부 결정
  const isFormValid = name.trim().length > 0 && email.trim().length > 0 && password.length >= 8 && agreed;

  const handleContinue = () => {
    if (isFormValid) {
      router.push(SIGNUP_ROUTES.PROFILE);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <SignupHeader />

          {/* Form Body */}
          <View style={styles.formContainer}>
            <CustomInput
              label="Your Name"
              placeholder="How should we call you?"
              value={name}
              onChangeText={setName}
            />
            <CustomInput
              label="email"
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <CustomInput
              label="password"
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TermsCheckbox
              checked={agreed}
              onToggle={() => setAgreed(!agreed)}
            />

            {/* Submit Button */}
            <View style={styles.buttonWrapper}>
              <PrimaryButton
                title="Continue"
                disabled={!isFormValid}
                onPress={handleContinue}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <SecurityFooter />
          </View>
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
    paddingBottom: 50, // Bottom padding
  },
  container: {
    width: '100%',
    maxWidth: 345,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    gap: 24,
    marginTop: 40,
  },
  buttonWrapper: {
    marginTop: 8,
    width: '100%',
  },
  footerContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  }
});
