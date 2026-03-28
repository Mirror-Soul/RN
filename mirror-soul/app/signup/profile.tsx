import React, { useState } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Colors } from '@/src/constants/theme';
import StepHeader from '@/src/components/signup/common/StepHeader';
import PassVerificationCard from '@/src/components/signup/steps/Step2_BasicProfile/PassVerificationCard';
import LocationSection from '@/src/components/signup/steps/Step2_BasicProfile/LocationSection';
import ProfessionalSection from '@/src/components/signup/steps/Step2_BasicProfile/ProfessionalSection';
import PrimaryButton from '@/src/components/signup/common/PrimaryButton';
import SecurityFooter from '@/src/components/home/SecurityFooter';
import { useRouter } from 'expo-router';

export default function BasicProfileScreen() {
  const [isFormValid, setIsFormValid] = useState(true); // 임시 활성화 (기본 상태)
  const router = useRouter();

  const handleContinue = () => {
    if (isFormValid) {
      router.push('/signup/express');
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
        {/* Main Content Container */}
        <View style={styles.container}>
          <StepHeader
            title="Basic Profile"
            subtitle="Help us find your perfect matches nearby"
          />

          {/* Profile Forms Body */}
          <View style={styles.formContainer}>
            <PassVerificationCard />
            <LocationSection />
            <ProfessionalSection />

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
    paddingBottom: 50,
  },
  container: {
    width: '100%',
    maxWidth: 345,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
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
