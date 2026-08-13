import FormLabel from '@/src/components/signup/common/FormLabel';
import {Colors, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
import React from 'react';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SectionProps } from '../types/step1';
import { isValidPassword } from '@/src/utils/validation';

import SeePasswordIcon from '@/assets/images/common/login/login_SeePassword.svg';

/**
 * PasswordSection 컴포넌트 (SRP)
 * 비밀번호 및 비밀번호 확인 입력을 관리합니다.
 */
export default function PasswordSection({ state, onChange }: SectionProps) {
  const { colors } = useThemeColors();
  const isInvalidPassword = state.password.length > 0 && !isValidPassword(state.password);
  const isMatch = isValidPassword(state.password) && state.password === state.passwordConfirm;
  const isMismatch = state.passwordConfirm.length > 0 && state.password !== state.passwordConfirm;

  return (
    <View style={styles.container}>
      {/* Password Input */}
      <View style={styles.fieldBox}>
        <FormLabel label="비밀번호" />
        <View style={[styles.inputWrapper, { borderBottomColor: colors.border.primary }]}>
          <TextInput
            style={[styles.textInput, isInvalidPassword && styles.inputError, { color: colors.text.primary }]}
            value={state.password}
            onChangeText={(text) => onChange({ password: text })}
            placeholder="영문, 숫자 포함 8~20자"
            placeholderTextColor={colors.text.muted}
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
          {isInvalidPassword && (
            <Text style={styles.errorText}>영문자, 숫자를 포함하여 8~20자로 입력해주세요.</Text>
          )}
        </View>
      </View>

      {/* Password Confirm Input */}
      <View style={styles.fieldBox}>
        <FormLabel label="비밀번호 확인" />
        <View style={[styles.inputWrapper, { borderBottomColor: colors.border.primary }]}>
          <TextInput
            style={[
              styles.textInput,
              isMismatch && styles.inputError,
              { color: colors.text.primary }
            ]}
            value={state.passwordConfirm}
            onChangeText={(text) => onChange({ passwordConfirm: text })}
            placeholder="다시 한번 입력해주세요"
            placeholderTextColor={colors.text.muted}
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
            accessibilityState={{ selected: state.isPasswordConfirmVisible }}
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
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.xl,
    alignSelf: 'stretch',
  },
  fieldBox: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  textInput: {
    flex: 1,
    padding: 0,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  toggleIcon: {
    flexShrink: 0,
  },
  inputError: {
    borderBottomColor: 'rgba(251, 44, 54, 0.5)',
  },
  messageArea: {
    minHeight: 16,
    justifyContent: 'center',
  },
  errorText: {
    color: Colors.primary.recordingRed,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
  },
  successText: {
    color: Colors.primary.successGreen,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
  }
});

