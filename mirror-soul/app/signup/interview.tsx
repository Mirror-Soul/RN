import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';

// Step 4 Components
import InterviewHeader from '@/src/components/signup/steps/Step4_Interview/interview/InterviewHeader';
import InterviewAIBox from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAIBox';
import InterviewAnswerBox from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAnswerBox';
import InterviewControls from '@/src/components/signup/steps/Step4_Interview/interview/InterviewControls';
import InterviewFooter from '@/src/components/signup/steps/Step4_Interview/InterviewFooter';

export default function InterviewScreen() {
  const router = useRouter();

  const handleRecordPress = () => {
    console.log('Voice recording started...');
    // TODO: implement recording logic
  };

  const handleNextPress = () => {
    console.log('Going to next step...');
    // router.push('/signup/nextStep');
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
          <InterviewHeader />

          {/* 3D Avatar Area Placeholder */}
          <View style={styles.avatarPlaceholder} />

          <View style={styles.body}>
            <InterviewAIBox />
            
            <View style={styles.answerWrapper}>
              <InterviewAnswerBox />
            </View>

            <View style={styles.controlsWrapper}>
              <InterviewControls 
                onRecordPress={handleRecordPress}
                onNextPress={handleNextPress}
              />
            </View>
          </View>

          <View style={styles.footerWrapper}>
            <InterviewFooter />
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.primary.soulBlack,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 345, // Figma design width scale base
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatarPlaceholder: {
    width: 256,
    height: 256,
    // Just a transparent or faint placeholder for now since 3D will go here
    marginVertical: 16,
  },
  body: {
    width: '100%',
    alignItems: 'center',
  },
  answerWrapper: {
    width: '100%',
    marginTop: 16,
  },
  controlsWrapper: {
    width: '100%',
    marginTop: 16,
  },
  footerWrapper: {
    width: '100%',
    marginTop: 32,
  },
});
