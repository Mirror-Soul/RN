import SecurityFooter from '@/src/components/home/SecurityFooter';
import SignupBackground from '@/src/components/signup/Account/SignupBackground';
import SignupHeader from '@/src/components/signup/Account/SignupHeader';
import TermsCheckbox from '@/src/components/signup/Account/TermsCheckbox';
import CustomInput from '@/src/components/signup/common/CustomInput';
import PrimaryButton from '@/src/components/signup/common/PrimaryButton';
import OnboardingSteps from '@/src/components/signup/common/OnboardingSteps';
import { Colors } from '@/src/constants/theme';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

export default function AccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 모든 폼이 입력되었는지 검사하여 버튼 활성화 여부 결정
  const isFormValid = name.trim().length > 0 && email.trim().length > 0 && password.length >= 8 && agreed;

  const handleContinue = () => {
    if (isFormValid) {
      console.log('Proceed to next step');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SignupBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Content Container */}
          <View style={styles.container}>
            <View style={styles.stepsWrapper}>
              <OnboardingSteps />
            </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 50, // Top margin padding
  },
  container: {
    width: '100%',
    maxWidth: 345, // Figma layout width matching
    alignItems: 'center',
  },
  stepsWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
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
