import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

import { DeleteWarningSection } from './components/DeleteWarningSection';
import { DeleteConsentSection } from './components/DeleteConsentSection';
import { DeleteConfirmBottomSheet } from './components/DeleteConfirmBottomSheet';
import { useDeleteAccountMutation } from './hooks/useDeleteAccountMutation';
import { performLogout } from '@/src/services/authService';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { useToast } from '@/src/components/common/Toast/ToastProvider';

export const AccountDeleteScreen = () => {
  const { colors } = useThemeColors();
  const router = useRouter();
  const { showToast } = useToast();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isConfirmSheetOpen, setIsConfirmSheetOpen] = useState(false);
  const deleteAccountMutation = useDeleteAccountMutation();

  const toggleConsent = () => setIsConsentChecked(!isConsentChecked);

  const handleOpenConfirm = () => {
    if (!isConsentChecked) return;
    setIsConfirmSheetOpen(true);
  };

  const handleCloseConfirm = () => setIsConfirmSheetOpen(false);

  const performDeleteAccount = async () => {
    if (deleteAccountMutation.isPending) return; // 연타로 인한 중복 탈퇴 요청 방지
    try {
      await deleteAccountMutation.mutateAsync();
    } catch (error) {
      setIsConfirmSheetOpen(false);
      showToast(getErrorDisplayMessage(error, '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.'), 'error');
      return;
    }

    // 탈퇴 자체는 이미 성공했으므로, 이후 로그아웃 처리(performLogout)가 예상치 못한 이유로
    // 실패하더라도 로그인 화면 이동은 항상 보장한다 (탈퇴 성공 후 화면에 머무는 것을 방지)
    try {
      await performLogout();
    } finally {
      setIsConfirmSheetOpen(false);
      router.replace('/');
    }
  };

  return (
    <ScreenLayout withScroll={true}>
      <Header title="회원 탈퇴" delay={0} />

      <View style={styles.content}>
        <DeleteWarningSection />
      </View>

      <DeleteConsentSection 
        isAgreed={isConsentChecked}
        onToggleAgree={toggleConsent}
        onSubmit={handleOpenConfirm}
      />

      <DeleteConfirmBottomSheet
        isOpen={isConfirmSheetOpen}
        onClose={handleCloseConfirm}
        onConfirm={performDeleteAccount}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
