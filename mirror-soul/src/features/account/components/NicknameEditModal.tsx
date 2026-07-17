import React, { useEffect } from 'react';
import {FontFamily, Colors} from '@/src/constants/theme';

import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ActivityIndicator, 
  Modal, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccountStore } from '@/src/store/useAccountStore';

const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상 입력해주세요.')
    .max(10, '닉네임은 10자 이하로 입력해주세요.')
    .regex(/^[가-힣a-zA-Z0-9]+$/, '특수문자 및 공백은 사용할 수 없습니다.'),
});

type NicknameFormData = z.infer<typeof nicknameSchema>;

interface NicknameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NicknameEditModal = ({ isOpen, onClose }: NicknameEditModalProps) => {
  const { nickname, setNickname } = useAccountStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: { nickname: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      reset({ nickname });
    }
  }, [isOpen, nickname, reset]);

  const onSubmit = async (data: NicknameFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // API delay mock
    setNickname(data.nickname);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          
          {/* Header */}
          <Text style={styles.title}>닉네임 수정</Text>
          <Text style={styles.subtitle}>앱에서 표시될 이름을 입력해 주세요.</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    style={[styles.input, errors.nickname && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    maxLength={10}
                    autoFocus={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.nickname && (
                    <Text style={styles.errorText}>{errors.nickname.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Buttons Row */}
          <View style={styles.buttonRow}>
            {/* 취소 버튼 */}
            <Pressable 
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressedState]} 
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>

            {/* 저장 버튼 */}
            <Pressable
              style={({ pressed }) => [
                styles.saveButtonContainer, 
                pressed && !isSubmitting && styles.pressedState,
                isSubmitting && styles.disabledState
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['rgba(0, 255, 255, 0.2)', 'rgba(168, 85, 247, 0.2)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="rgba(0, 255, 255, 0.9)" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>저장</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderWidth: 0.61,
    borderColor: Colors.glass.white10,
    borderRadius: 24,
    padding: 24,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 27,
    letterSpacing: -0.44,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    color: '#6A7282',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    height: 45,
    backgroundColor: Colors.glass.white5,
    borderWidth: 0.61,
    borderColor: 'rgba(139, 230, 248, 0.19)',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontFamily: FontFamily.sans,
    fontSize: 14,
  },
  inputError: {
    borderColor: '#FF4C4C',
    backgroundColor: 'rgba(255, 76, 76, 0.05)',
  },
  errorText: {
    fontFamily: FontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    color: '#FF4C4C',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.glass.white5,
    borderWidth: 0.61,
    borderColor: Colors.glass.white10,
    borderRadius: 16,
  },
  cancelButtonText: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 14,
    color: '#D1D5DC',
    letterSpacing: -0.15,
  },
  saveButtonContainer: {
    flex: 1,
    height: 45,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.61,
    borderColor: 'rgba(0, 255, 255, 0.25)',
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: FontFamily.sans,
    fontWeight: '500',
    fontSize: 14,
    color: 'rgba(0, 255, 255, 0.9)',
    letterSpacing: -0.15,
  },
  pressedState: {
    opacity: 0.6,
  },
  disabledState: {
    opacity: 0.5,
  },
});
