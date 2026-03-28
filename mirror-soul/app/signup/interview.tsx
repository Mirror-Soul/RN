import React from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';

// Step 4 Components
import InterviewHeader from '@/src/components/signup/steps/Step4_Interview/interview/InterviewHeader';
import InterviewAvatar from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAvatar';
import InterviewAIBox from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAIBox';
import InterviewAnswerBox from '@/src/components/signup/steps/Step4_Interview/interview/InterviewAnswerBox';
import InterviewControls from '@/src/components/signup/steps/Step4_Interview/interview/InterviewControls';
import InterviewFooter from '@/src/components/signup/steps/Step4_Interview/interview/InterviewFooter';

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
          <InterviewHeader
            title="The Soul Capture"
            currentQuestion={1}
            totalQuestions={5}
          />

          {/* 3D Avatar Model */}
          <InterviewAvatar />

          <View style={styles.body}>
            <InterviewAIBox
              category="외향성 (Extraversion)"
              question="금요일 저녁입니다. 활기찬 파티에 초대받았지만, 이번 주는 정말 힘들었어요. 사람들을 만나며 에너지를 충전하시나요, 아니면 집에서 혼자 쉬며 재충전하시나요?"
            />
            
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
