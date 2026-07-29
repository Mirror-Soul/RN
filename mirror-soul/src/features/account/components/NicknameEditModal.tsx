import React, { useEffect } from 'react';
import {FontFamily, Colors, FontSize, FontWeight, Radii, Spacing} from '@/src/constants/theme';
import { useThemeColors } from '@/src/hooks/useThemeColors';

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
import { modifyNickname } from '@/src/services/profileService';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';

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
  const { colors, isDark } = useThemeColors();
  
  const { nickname, setNickname } = useAccountStore();

  const {
    control,
    handleSubmit,
    reset,
    setError,
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
    try {
      await modifyNickname(data.nickname);
      setNickname(data.nickname);
      onClose();
    } catch (error) {
      setError('nickname', { message: getErrorDisplayMessage(error, '닉네임 변경에 실패했습니다.') });
    }
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
        style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }]}
      >
        <View style={[styles.container, { backgroundColor: colors.background.card, borderColor: colors.border.primary }]}>
          
          {/* Header */}
          <Text style={[styles.title, { color: colors.text.primary }]}>닉네임 수정</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>앱에서 표시될 이름을 입력해 주세요.</Text>

          {/* Form */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: colors.text.primary, 
                        backgroundColor: colors.background.glass, 
                        borderColor: colors.border.primary 
                      },
                      errors.nickname && styles.inputError
                    ]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    maxLength={10}
                    autoFocus={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={colors.text.muted}
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
              style={({ pressed }) => [
                styles.cancelButton,
                { backgroundColor: colors.background.glass, borderColor: colors.border.primary },
                pressed && styles.pressedState
              ]} 
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>취소</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  container: {
    width: '100%',
    maxWidth: 384,
    borderWidth: 0.61,
    borderRadius: Radii.xl,
    padding: Spacing.xxl,
  },
  title: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.xl,
    lineHeight: 27,
    letterSpacing: -0.44,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
    marginBottom: Spacing.xl,
  },
  formContainer: {
    marginBottom: Spacing.xxl,
  },
  input: {
    height: 45,
    borderWidth: 0.61,
    borderRadius: Radii.md2,
    paddingHorizontal: Spacing.lg,
    fontFamily: FontFamily.sans,
    fontSize: FontSize.base,
  },
  inputError: {
    borderColor: '#FF4C4C',
    backgroundColor: 'rgba(255, 76, 76, 0.05)',
  },
  errorText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.regular,
    fontSize: FontSize.sm,
    color: '#FF4C4C',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.61,
    borderRadius: Radii.lg,
  },
  cancelButtonText: {
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
    letterSpacing: -0.15,
  },
  saveButtonContainer: {
    flex: 1,
    height: 45,
    borderRadius: Radii.lg,
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
    fontWeight: FontWeight.medium,
    fontSize: FontSize.base,
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
