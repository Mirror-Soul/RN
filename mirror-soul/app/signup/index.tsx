import Step1AccountContainer from '@/src/components/signup/steps/Step1_Account/Step1AccountContainer';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

/**
 * AccountScreen (Signup Step 1)
 * 회원가입의 시작점인 계정 생성 화면입니다.
 * 고도화된 Step1AccountContainer를 호출하여 UI와 로직을 렌더링합니다. (SRP)
 */
export default function AccountScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <Step1AccountContainer />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#000',
  },
});
