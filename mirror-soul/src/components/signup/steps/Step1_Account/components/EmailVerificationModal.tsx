import VerifyEmailIcon from '@/assets/images/common/veritfy_email_icon.svg';
import {Colors, Radii, FontFamily} from '@/src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { getErrorMessage } from '@/src/utils/errorUtils';
import { ActivityIndicator, Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { VerificationModalProps } from '../types/step1';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * EmailVerificationModal 컴포넌트 (SRP)
 * 이메일로 발송된 6자리 코드를 입력받는 모달입니다.
 */
export default function EmailVerificationModal({ 
  isVisible, 
  email, 
  onClose, 
  onVerify,
  timeLeft = 180,
  formattedTime = '03:00',
  onResend,
  isLoading = false,
}: VerificationModalProps) {
  const { colors } = useThemeColors();
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 애니메이션 공유값 (심플한 페이드 전용)
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // 모달이 나타날 때 (심플하게 페이드 인)
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // 모달이 사라질 때
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, opacity]);

  // 모달이 닫힐 때 입력된 코드와 에러를 초기화 (보안 및 UX 개선)
  useEffect(() => {
    if (!isVisible) {
      setCode('');
      setErrorMessage('');
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleConfirm = async () => {
    if (code.length === 6 && !isVerifying) {
      try {
        setIsVerifying(true);
        const success = await onVerify(code);
        if (success) {
          onClose();
        } else {
          setErrorMessage('인증 코드가 일치하지 않습니다. 다시 확인해주세요.');
        }
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error, '인증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.background.overlay || 'rgba(0, 0, 0, 0.6)' }]}>
        <Animated.View style={[styles.modalContainer, animatedStyle, { backgroundColor: colors.background.card || 'rgba(16, 24, 40, 0.95)' }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.iconCircle}>
                <LinearGradient
                  colors={['rgba(0, 211, 243, 0.20)', 'rgba(194, 122, 255, 0.20)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <VerifyEmailIcon width={24} height={24} />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={[styles.title, { color: colors.text.primary }]}>이메일 인증</Text>
                <Text style={styles.subtitle}>인증 코드를 확인해주세요</Text>
              </View>
            </View>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Email Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoEmail}>{email}</Text>
              <Text style={styles.infoText}>위 이메일로 6자리 인증 코드를 발송했습니다.</Text>
            </View>

            {/* Code Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>인증 코드</Text>
                <Text style={[styles.timerText, timeLeft === 0 && styles.timerTextExpired]}>
                  {formattedTime}
                </Text>
              </View>
              <TextInput
                style={[styles.codeTextInput, errorMessage ? styles.codeTextInputError : null, { color: colors.text.primary }]}
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="000000"
                placeholderTextColor={colors.text.muted}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                editable={timeLeft > 0}
              />
              {!!errorMessage && (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {errorMessage}
                </Text>
              )}
            </View>

            {/* Buttons Row */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={[styles.cancelText, { color: colors.text.primary }]}>취소</Text>
              </TouchableOpacity>
              
              {timeLeft === 0 ? (
                <TouchableOpacity style={styles.resendButton} onPress={onResend}>
                  <Text style={styles.resendText}>재발송</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.confirmButton, code.length === 6 && !isVerifying && styles.confirmButtonActive]}
                  onPress={handleConfirm}
                  disabled={code.length !== 6 || isVerifying}
                >
                  {isVerifying ? (
                    <ActivityIndicator size="small" color={colors.text.primary} />
                  ) : (
                    <Text style={[styles.confirmText, { color: code.length === 6 ? colors.text.primary : colors.text.muted }]}>인증 확인</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 392,
    height: 'auto',
    borderRadius: Radii.xl,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    overflow: 'hidden',
  },
  header: {
    padding: 23.994,
    borderBottomWidth: 0.612,
    borderBottomColor: Colors.glass.white10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11.992,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radii.full, // Pill 형태
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerTextCol: {
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.sans,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    letterSpacing: -0.449,
  },
  subtitle: {
    color: Colors.neutral.lightGray,
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  body: {
    padding: 23.994,
    gap: 24,
  },
  infoBox: {
    padding: 16.611,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: 'rgba(0, 211, 243, 0.20)',
    backgroundColor: 'rgba(0, 211, 243, 0.10)',
    gap: 2,
  },
  infoEmail: {
    color: '#00D3F3',
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22.75,
    letterSpacing: -0.15,
  },
  infoText: {
    color: Colors.neutral.lightGrayText,
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22.75,
    letterSpacing: -0.15,
  },
  inputSection: {
    gap: 7.995,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  label: {
    color: Colors.neutral.lightGray,
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  codeTextInput: {
    height: 57.197,
    backgroundColor: Colors.glass.white5,
    borderRadius: Radii.lg,
    borderWidth: 0.612,
    borderColor: Colors.glass.white10,
    paddingHorizontal: 16,
    textAlign: 'center',
    fontFamily: 'Menlo', // 고정 폭 폰트
    fontSize: 24,
    letterSpacing: 2.4, // Spec: 2.4px
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 11.992,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: Radii.md2,
    backgroundColor: Colors.glass.white5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: Radii.md2,
    backgroundColor: Colors.glass.white5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonActive: {
    backgroundColor: Colors.glass.white10, // 살짝 밝게
  },
  confirmText: {
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '500',
  },
  codeTextInputError: {
    borderColor: Colors.primary.activeRedText,
    borderWidth: 1.5,
  },
  errorText: {
    color: Colors.primary.activeRedText,
    fontFamily: FontFamily.sans,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  timerText: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: 14,
    fontWeight: '500',
  },
  timerTextExpired: {
    color: Colors.primary.activeRedText,
  },
  resendButton: {
    flex: 1,
    height: 48,
    borderRadius: Radii.md2,
    backgroundColor: 'rgba(0, 211, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 211, 243, 0.3)',
  },
  resendText: {
    color: Colors.primary.electricCyan,
    fontFamily: FontFamily.sans,
    fontSize: 16,
    fontWeight: '500',
  },
});
