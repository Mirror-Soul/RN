import React, { forwardRef, useCallback, useState } from 'react';
import {
  ReturnKeyTypeOptions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors, FontFamily, FontSize, FontWeight, Spacing} from '@/src/constants/theme';
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
        ? Colors.primary.electricCyan
        : colors.border.primary;

    return (
      <View style={[styles.container, { borderBottomColor: borderColor }]}>
        <Icon width={18} height={18} />

        <TextInput
          ref={ref}
          style={[styles.input, { color: colors.text.primary }]}
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
            onPress={handleToggleVisibility}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            accessibilityState={{ selected: isPasswordVisible }}
            hitSlop={{ top: Spacing.md, bottom: Spacing.md, left: Spacing.md, right: Spacing.md }}
          >
            <SeePasswordIcon width={18} height={18} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
});
