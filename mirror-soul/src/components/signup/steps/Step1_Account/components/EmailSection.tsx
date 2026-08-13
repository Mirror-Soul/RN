import FormLabel from '@/src/components/signup/common/FormLabel';
import {Colors, FontFamily, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { isValidEmail } from '@/src/utils/validation';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SectionProps } from '../types/step1';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import EmailVerificationModal from './EmailVerificationModal';

interface EmailSectionProps extends SectionProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  onSendCode: () => void;
  onVerify: (code: string) => Promise<boolean>;
  timeLeft?: number;
  isTimerActive?: boolean;
  formattedTime?: string;
  onResendCode?: () => void;
  isLoading?: boolean;
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
  onResendCode = onSendCode,
  isLoading = false
}: EmailSectionProps) {
  const { colors } = useThemeColors();

  // 버튼 텍스트 및 접근성 동기화를 위한 렌더링 전 상태 처리 (DRY/SRP 유지보수)
  const sendButtonText = isTimerActive && timeLeft > 0
    ? '인증 코드 입력'
    : isTimerActive && timeLeft === 0
      ? '재발송'
      : '인증 코드 발송';

  const sendButtonA11yHint = isTimerActive && timeLeft > 0
    ? '다시 이메일 인증 코드를 입력할 수 있는 팝업 창을 엽니다'
    : isTimerActive && timeLeft === 0
      ? '유효시간이 초과되어 인증 코드를 다시 이메일로 발송합니다'
      : '입력한 이메일 주소로 인증 코드를 전송합니다';

  return (
    <View style={styles.container}>
      <FormLabel label="이메일" />

      <View style={[styles.inputRow, { borderBottomColor: colors.border.primary }]}>
        <TextInput
          style={[styles.emailInput, { color: colors.text.primary }]}
          value={state.email}
          onChangeText={(text) => onChange({ email: text })}
          placeholder="your@email.com"
          placeholderTextColor={colors.text.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!state.isEmailVerified}
          accessibilityLabel="이메일 입력란"
          accessibilityHint="가입에 사용할 유효한 이메일 주소를 입력해 주세요"
          accessibilityState={{ disabled: state.isEmailVerified }}
        />
        {!state.isEmailVerified && (
          <TouchableOpacity
            style={[
              styles.sendButton,
              { borderColor: (!isValidEmail(state.email) || isLoading) ? colors.border.primary : Colors.primary.electricCyan },
            ]}
            onPress={isTimerActive && timeLeft === 0 ? onResendCode : onSendCode}
            disabled={!isValidEmail(state.email) || isLoading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={sendButtonText}
            accessibilityHint={sendButtonA11yHint}
            accessibilityState={{ disabled: !isValidEmail(state.email) || isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.primary.electricCyan} />
            ) : (
              <Text
                numberOfLines={1}
                style={[styles.sendButtonText, (!isValidEmail(state.email) || isLoading) && { color: colors.text.muted }]}
              >
                {sendButtonText}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.messageRow}>
        {isTimerActive && timeLeft > 0 && !state.isEmailVerified && (
          <Text style={styles.timerText}>남은 시간 {formattedTime}</Text>
        )}
        {!!state.emailError && !state.isEmailVerified && (
          <Text style={[styles.errorText, { color: colors.state.danger }]}>{state.emailError}</Text>
        )}
        {state.isEmailVerified && (
          <Text style={styles.successText}>이메일 인증이 완료되었습니다</Text>
        )}
      </View>

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
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    alignSelf: 'stretch',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  emailInput: {
    flex: 1,
    padding: 0,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
  },
  sendButton: {
    flexShrink: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  sendButtonText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary.electricCyan,
  },
  messageRow: {
    minHeight: 16,
  },
  successText: {
    color: Colors.primary.successGreen,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
  },
  errorText: {
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
  },
  timerText: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
});



