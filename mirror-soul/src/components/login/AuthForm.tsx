import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Parts Components
import AuthButton from './parts/AuthButton';
import AuthInput from './parts/AuthInput';

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

  const handleLogin = () => {
    console.log('Login logic here:', email, password);
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
    width: 344.94,
    height: 242.41,
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
  dividerWrapper: {
    marginTop: 40,
    width: '100%',
  },
});

