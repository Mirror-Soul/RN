import React, { forwardRef, useCallback, useState } from 'react';
import {
  ReturnKeyTypeOptions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontFamily, Radii } from '@/src/constants/theme';
import EmailIcon from '@/assets/images/common/login/login_email.svg';
import PasswordIcon from '@/assets/images/common/login/login_password.svg';
import SeePasswordIcon from '@/assets/images/common/login/login_SeePassword.svg';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface AuthInputProps {
  type: 'email' | 'password';
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** 에러 상태 시 빨간 테두리 표시 */
  hasError?: boolean;
  /** 완료 키 입력 시 다음 필드 포커스 또는 제출 */
  onSubmitEditing?: () => void;
  /** 키보드 완료 키 타입 ('next' | 'done') */
  returnKeyType?: ReturnKeyTypeOptions;
}

/**
 * AuthInput 컴포넌트
 * 이메일 및 비밀번호 입력 인풋.
 *
 * - forwardRef로 부모에서 ref 제어 가능 (필드 간 포커스 이동)
 * - isFocused 상태에 따른 Cyan 테두리 glow
 * - hasError 시 red 테두리
 * - 비밀번호 표시/숨기기 토글
 */
const AuthInput = forwardRef<TextInput, AuthInputProps>(
  (
    {
      type,
      value,
      onChangeText,
      placeholder,
      hasError = false,
      onSubmitEditing,
      returnKeyType,
    },
    ref,
  ) => {
    const { colors } = useThemeColors();
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = type === 'password';
    const Icon = isPassword ? PasswordIcon : EmailIcon;

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);
    const handleToggleVisibility = useCallback(
      () => setIsPasswordVisible((prev) => !prev),
      [],
    );

    // 우선순위: 에러 > 포커스 > 기본
    const borderColor = hasError
      ? 'rgba(251, 44, 54, 0.60)'
      : isFocused
        ? Colors.glass.cyan30_d3
        : colors.border.primary;

    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Icon width={20} height={20} />
        </View>

        <TextInput
          ref={ref}
          style={[
            styles.input,
            { 
              borderColor, 
              backgroundColor: colors.background.glass,
              color: colors.text.primary 
            },
            isPassword && { paddingRight: 48 },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          textContentType={type === 'email' ? 'emailAddress' : 'password'}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={type === 'email' ? '이메일 입력' : '비밀번호 입력'}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.seePasswordContainer}
            onPress={handleToggleVisibility}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            accessibilityState={{ selected: isPasswordVisible }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <SeePasswordIcon width={20} height={20} />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 57,
    position: 'relative',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingLeft: 48,
    paddingRight: 16,
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.312,
  },
  seePasswordContainer: {
    position: 'absolute',
    right: 16,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
