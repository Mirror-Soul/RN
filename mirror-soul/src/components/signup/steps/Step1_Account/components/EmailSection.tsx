import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '@/src/constants/theme';
import { SectionProps } from '../types/step1';
import FormLabel from '@/src/components/signup/common/FormLabel';
import CompleteCheck from './CompleteCheck';
import EmailVerificationModal from './EmailVerificationModal';

interface EmailSectionProps extends SectionProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  onSendCode: () => void;
  onVerify: (code: string) => boolean;
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
  onVerify 
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
            onPress={onSendCode}
            disabled={!state.email.includes('@')}
            accessibilityRole="button"
            accessibilityLabel="인증 코드 발송"
            accessibilityHint="입력한 이메일 주소로 인증 코드를 전송합니다"
            accessibilityState={{ disabled: !state.email.includes('@') }}
          >
            <Text style={styles.sendButtonText}>인증 코드 발송</Text>
          </TouchableOpacity>
        )}
      </View>

      {state.isEmailVerified && (
        <Text style={styles.successText}>이메일 인증이 완료되었습니다.</Text>
      )}

      {/* Verification Modal */}
      <EmailVerificationModal
        isVisible={isModalVisible}
        email={state.email}
        onClose={() => setIsModalVisible(false)}
        onVerify={onVerify}
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
});



