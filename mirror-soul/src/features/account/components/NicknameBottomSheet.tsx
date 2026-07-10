import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BottomSheet } from '@/src/components/common/BottomSheet/BottomSheet';
import { useAccountStore } from '@/src/store/useAccountStore';

const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상 입력해주세요.')
    .max(10, '닉네임은 10자 이하로 입력해주세요.')
    .regex(/^[가-힣a-zA-Z0-9]+$/, '특수문자 및 공백은 사용할 수 없습니다.'),
});

type NicknameFormData = z.infer<typeof nicknameSchema>;

interface NicknameBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NicknameBottomSheet = ({ isOpen, onClose }: NicknameBottomSheetProps) => {
  const { nickname, setNickname } = useAccountStore();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NicknameFormData>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname: '',
    },
    mode: 'onChange',
  });

  // 바텀 시트 열릴 때마다 초기값 셋팅
  useEffect(() => {
    if (isOpen) {
      reset({ nickname });
    }
  }, [isOpen, nickname, reset]);

  const onSubmit = async (data: NicknameFormData) => {
    // 닉네임 수정 API 통신 Mock (실무에서는 React Query Mutation)
    await new Promise((resolve) => setTimeout(resolve, 800)); // 0.8초 딜레이
    setNickname(data.nickname);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height={380}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>닉네임 수정</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>새 닉네임</Text>

          <Controller
            control={control}
            name="nickname"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.nickname && styles.inputError]}
                  placeholder="새로운 닉네임을 입력하세요"
                  placeholderTextColor="#4A5565"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={10}
                  autoFocus={true} // 시트가 열리면 자동 포커스
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.nickname && (
                  <Text style={styles.errorText}>{errors.nickname.message}</Text>
                )}
              </View>
            )}
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
              pressed && !isSubmitting && styles.submitButtonPressed,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>저장하기</Text>
            )}
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: -0.44,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    color: '#99A1AF',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 16,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#FF4C4C',
    backgroundColor: 'rgba(255, 76, 76, 0.05)',
  },
  errorText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#FF4C4C',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  submitButton: {
    height: 52,
    backgroundColor: '#00D3F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonPressed: {
    backgroundColor: '#00B8D4',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(0, 211, 242, 0.5)',
  },
  submitButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 16,
    color: '#000000',
  },
});
