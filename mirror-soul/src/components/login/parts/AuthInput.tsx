import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, Radii } from '@/src/constants/theme';
import EmailIcon from '@/assets/images/common/login/login_email.svg';
import PasswordIcon from '@/assets/images/common/login/login_password.svg';
import SeePasswordIcon from '@/assets/images/common/login/login_SeePassword.svg';

interface AuthInputProps {
  type: 'email' | 'password';
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * AuthInput 컴포넌트
 * 이메일 및 비밀번호 입력을 위한 스타일링 및 아이콘 지원.
 */
export default function AuthInput({ type, value, onChangeText, placeholder }: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = type === 'password';
  const Icon = isPassword ? PasswordIcon : EmailIcon;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon width={20} height={20} />
      </View>
      <TextInput
        style={[styles.input, isPassword && { paddingRight: 48 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6A7282"
        secureTextEntry={isPassword && !isPasswordVisible}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {isPassword && (
        <TouchableOpacity
          style={styles.seePasswordContainer}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          accessibilityRole="button"
          accessibilityLabel="비밀번호 표시 설정"
          accessibilityHint={isPasswordVisible ? "비밀번호를 숨깁니다" : "비밀번호를 표시합니다"}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <SeePasswordIcon width={20} height={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 57.21,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingLeft: 48,
    paddingRight: 16,
    color: Colors.neutral.pureWhite,
    fontFamily: 'Inter',
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
