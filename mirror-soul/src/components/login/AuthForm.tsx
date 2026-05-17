import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

// Parts Components
import AuthButton from './parts/AuthButton';
import AuthInput from './parts/AuthInput';
import { login } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';

interface AuthFormProps {
  activeTab: 'login' | 'signup';
}

/**
 * AuthForm 컴포넌트
 * 로그인 또는 회원가입 폼을 동적으로 렌더링.
 */
export default function AuthForm({ activeTab }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await login(email, password);
      if (response.isSuccess) {
        // Zustand 스토어 업데이트 -> _layout.tsx 라우팅 가드가 자동 감지 후 화면 이동 (SoC 준수)
        await useAuthStore.getState().login({
          accessToken: response.result.accessToken,
          refreshToken: response.result.refreshToken,
          userUuid: response.result.userUuid,
          userStatus: response.result.userStatus,
        });
      } else {
        Alert.alert('로그인 실패', response.message || '이메일 또는 비밀번호를 확인해주세요.');
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '로그인 처리 중 문제가 발생했습니다.');
    }
  };

  const handleStartSignup = () => {
    router.push('/signup');
  };

  // --- Signup View ---
  if (activeTab === 'signup') {
    return (
      <View style={styles.container}>
        <View style={styles.signupCenter}>
          <AuthButton
            title="회원가입 시작하기"
            onPress={handleStartSignup}
          />
        </View>
      </View>
    );
  }

  // --- Login View ---
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

      <AuthButton
        title="로그인"
        onPress={handleLogin}
        style={styles.loginButtonMargin}
      />

      <TouchableOpacity style={styles.findPwButton}>
        <Text style={styles.findPwText}>비밀번호를 잊으셨나요?</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 242.41,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  signupCenter: {
    flex: 1,
    justifyContent: 'center', // 회원가입 버튼 중앙 정렬
  },
  inputGap: {
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  loginButtonMargin: {
    marginTop: 8,
  },
  findPwButton: {
    marginTop: 16,
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
});

