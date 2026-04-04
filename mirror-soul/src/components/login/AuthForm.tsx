import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii } from '@/src/constants/theme';
import AuthInput from './AuthInput';
import ContinueIcon from '@/assets/images/common/Continue_icon.svg';

interface AuthFormProps {
  activeTab: 'login' | 'signup';
}

/**
 * AuthForm 컴포넌트
 * 로그인 또는 회원가입 폼을 동적으로 렌더링.
 * 현재는 로그인 폼만 스펙에 맞춰 구현되어 있습니다.
 */
export default function AuthForm({ activeTab }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (activeTab === 'signup') {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>회원가입 폼 (추후 구현 예정)</Text>
      </View>
    );
  }

  // --- Login Form ---
  return (
    <View style={styles.container}>
      <View style={styles.inputGap}>
        <AuthInput
          type="email"
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
        />
        <AuthInput
          type="password"
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => console.log('Login logic here')}
        style={styles.loginButtonWrapper}
      >
        <LinearGradient
          colors={Colors.gradient.cyanToPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>로그인</Text>
          <ContinueIcon width={24} height={24} />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.findPwButton}>
        <Text style={styles.findPwText}>비밀번호를 잊으셨나요?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 344.94,
    height: 242.41,
    gap: 16,
    alignItems: 'center',
  },
  inputGap: {
    gap: 12, // Spec gap between email and password
    width: '100%',
  },
  loginButtonWrapper: {
    width: 344.94,
    height: 56,
    borderRadius: Radii.lg,
    // iOS Shadow
    shadowColor: 'rgba(173, 70, 255, 0.3)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
    // Android Shadow
    elevation: 8,
    marginTop: 8, // Adjust based on spec spacing
  },
  loginButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.lg,
    gap: 8,
  },
  loginText: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: -0.312,
  },
  findPwButton: {
    marginTop: 0,
  },
  findPwText: {
    color: '#99A1AF',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  placeholderContainer: {
    width: 344.94,
    height: 242.41,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.white10,
    borderRadius: Radii.lg,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: Colors.neutral.lightGray,
    fontSize: 14,
  },
});
