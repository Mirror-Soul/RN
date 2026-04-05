import FormLabel from '@/src/components/signup/common/FormLabel';
import { Colors } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SectionProps } from '../types/step1';

import SeePasswordIcon from '@/assets/images/common/login/login_SeePassword.svg';

/**
 * PasswordSection 컴포넌트 (SRP)
 * 비밀번호 및 비밀번호 확인 입력을 관리합니다.
 */
export default function PasswordSection({ state, onChange }: SectionProps) {
  const isShort = state.password.length > 0 && state.password.length < 8;
  const isMatch = state.password.length >= 8 && state.password === state.passwordConfirm;
  const isMismatch = state.passwordConfirm.length > 0 && state.password !== state.passwordConfirm;

  return (
    <View style={styles.container}>
      {/* Password Input */}
      <View style={styles.fieldBox}>
        <FormLabel label="비밀번호" />
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.textInput, isShort && styles.inputError]}
            value={state.password}
            onChangeText={(text) => onChange({ password: text })}
            placeholder="최소 8자 이상"
            placeholderTextColor="#6A7282"
            secureTextEntry={!state.isPasswordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.toggleIcon}
            onPress={() => onChange({ isPasswordVisible: !state.isPasswordVisible })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={state.isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            accessibilityHint="비밀번호 입력값 표시 상태를 전환합니다"
            accessibilityState={{ selected: state.isPasswordVisible }}
          >
            <SeePasswordIcon width={20} height={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.messageArea}>
          {isShort && (
            <Text style={styles.errorText}>최소 8자 이상 입력해주세요.</Text>
          )}
        </View>
      </View>

      {/* Password Confirm Input */}
      <View style={styles.fieldBox}>
        <FormLabel label="비밀번호 확인" />
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.textInput,
              isMismatch && styles.inputError
            ]}
            value={state.passwordConfirm}
            onChangeText={(text) => onChange({ passwordConfirm: text })}
            placeholder="다시 한번 입력해주세요"
            placeholderTextColor="#6A7282"
            secureTextEntry={!state.isPasswordConfirmVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.toggleIcon}
            onPress={() => onChange({ isPasswordConfirmVisible: !state.isPasswordConfirmVisible })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={state.isPasswordConfirmVisible ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'}
            accessibilityHint="비밀번호 확인 입력값 표시 상태를 전환합니다"
            accessibilityState={{ pressed: state.isPasswordConfirmVisible }}
          >
            <SeePasswordIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Feedback Message Area */}
        <View style={styles.messageArea}>
          {isMismatch && (
            <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
          )}
          {isMatch && (
            <Text style={styles.successText}>비밀번호가 일치합니다.</Text>
          )}
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    width: 344.94,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10, // Reduced from 24 to manage space better
    alignSelf: 'stretch',
  },
  fieldBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 7.995,
    alignSelf: 'stretch',
  },
  inputWrapper: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  textInput: {
    height: 49.202,
    paddingLeft: 16,
    paddingRight: 48, // Icon space
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 0.612,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFF',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.312,
    alignSelf: 'stretch',
  },
  toggleIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  inputError: {
    borderColor: 'rgba(251, 44, 54, 0.5)',
  },
  messageArea: {
    // height: 16, // Fixed height to prevent layout jump or overlap
    justifyContent: 'center',
  },
  errorText: {
    color: '#FB2C36',
    fontFamily: 'Inter',
    fontSize: 12,
  },
  successText: {
    color: Colors.primary.successGreen,
    fontFamily: 'Inter',
    fontSize: 12,
  }
});

