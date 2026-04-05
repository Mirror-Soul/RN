import Step1AccountContainer from '@/src/components/signup/steps/Step1_Account/Step1AccountContainer';
import { Layout } from '@/src/constants/theme';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

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
      <View style={styles.container}>
        <Step1AccountContainer />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.MAX_CONTENT_WIDTH,
    alignItems: 'center',
  }
});


