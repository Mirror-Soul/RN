import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { SectionProps } from '../types/step1';
import FormLabel from '@/src/components/signup/common/FormLabel';
import CompleteCheck from './CompleteCheck';
import EmailVerificationModal from './EmailVerificationModal';
import { isValidEmail } from '@/src/utils/validation';

interface EmailSectionProps extends SectionProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  onSendCode: () => void;
  onVerify: (code: string) => boolean;
  timeLeft?: number;
  isTimerActive?: boolean;
  formattedTime?: string;
  onResendCode?: () => void;
}

/**
 * EmailSection 컴포넌트 (SRP)
 * 이메일 입력 및 인증 코드 발송 로직을 관리합니다.
 */
export default function EmailSection({ 
  state, 
  onChange, 
  isModalVisible, 
  setIsModalVisible, 
  onSendCode, 
  onVerify,
  timeLeft = 0,
  isTimerActive = false,
  formattedTime = '00:00',
  onResendCode = onSendCode
}: EmailSectionProps) {
  return (
    <View style={[styles.container, state.isEmailVerified && { height: 77 }]}>
      <FormLabel label="이메일" />
      
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.emailInput, 
            state.isEmailVerified && { width: '100%', borderColor: Colors.glass.white10 }
          ]}
          value={state.email}
          onChangeText={(text) => onChange({ email: text })}
          placeholder="your@email.com"
          placeholderTextColor="#6A7282"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!state.isEmailVerified}
        />
        {!state.isEmailVerified && (
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={isTimerActive && timeLeft === 0 ? onResendCode : onSendCode}
            disabled={!isValidEmail(state.email)}
            accessibilityRole="button"
            accessibilityLabel="인증 코드 발송"
            accessibilityHint="입력한 이메일 주소로 인증 코드를 전송합니다"
            accessibilityState={{ disabled: !isValidEmail(state.email) }}
          >
            <Text style={styles.sendButtonText}>
              {isTimerActive && timeLeft > 0 ? '인증 코드 입력' : isTimerActive && timeLeft === 0 ? '재발송' : '인증 코드 발송'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 남은 시간 표시 (버튼 하단) */}
      {isTimerActive && timeLeft > 0 && !state.isEmailVerified && (
        <View style={styles.timerOutsideRow}>
          <Text style={styles.timerOutsideText}>남은 시간: {formattedTime}</Text>
        </View>
      )}

      {state.isEmailVerified && (
        <Text style={styles.successText}>이메일 인증이 완료되었습니다.</Text>
      )}

      {/* Verification Modal */}
      <EmailVerificationModal
        isVisible={isModalVisible}
        email={state.email}
        onClose={() => setIsModalVisible(false)}
        onVerify={onVerify}
        timeLeft={timeLeft}
        formattedTime={formattedTime}
        onResend={onResendCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 7.995,
    alignSelf: 'stretch',
    position: 'relative', // absolute 자식을 기준잡기 위해 추가
  },
  inputRow: {
    height: 49.202,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7.995,
    alignSelf: 'stretch',
  },
  emailInput: {
    width: 224.942,
    height: 49.202,
    paddingHorizontal: 16,
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
  },
  sendButton: {
    flex: 1,
    height: 49.202,
    paddingVertical: 14.5, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  sendButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  successText: {
    color: Colors.primary.successGreen,
    fontFamily: 'Inter',
    fontSize: 12,
    marginTop: 4,
  },
  timerOutsideRow: {
    position: 'absolute',
    bottom: -22, // 컴포넌트 하단 바깥(여백 공간)으로 띄움으로써 UI 밀림 원천 차단
    right: 0, // 컨테이너 우측 끝 정렬 (버튼 우측 끝과 일치)
  },
  timerOutsideText: {
    color: Colors.primary.electricCyan,
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
  },
});



