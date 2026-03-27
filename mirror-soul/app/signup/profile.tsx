import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Colors } from '@/src/constants/theme';
import SignupBackground from '@/src/components/signup/Account/SignupBackground';
import OnboardingSteps from '@/src/components/signup/common/OnboardingSteps';
import ProfileHeader from '@/src/components/signup/BasicProfile/ProfileHeader';
import PassVerificationCard from '@/src/components/signup/BasicProfile/PassVerificationCard';
import LocationSection from '@/src/components/signup/BasicProfile/LocationSection';
import ProfessionalSection from '@/src/components/signup/BasicProfile/ProfessionalSection';
import PrimaryButton from '@/src/components/signup/common/PrimaryButton';
import SecurityFooter from '@/src/components/home/SecurityFooter';

export default function BasicProfileScreen() {
  const [isFormValid, setIsFormValid] = useState(true); // 임시 활성화 (기본 상태)

  const handleContinue = () => {
    console.log('Proceed to step 3');
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
              {/* 스텝 2: Basic Profile 이므로 currentStep에 2를 할당 */}
              <OnboardingSteps currentStep={2} />
            </View>
            <ProfileHeader 
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
    paddingVertical: 50, 
  },
  container: {
    width: '100%',
    maxWidth: 345, 
    alignItems: 'center',
  },
  stepsWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
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
