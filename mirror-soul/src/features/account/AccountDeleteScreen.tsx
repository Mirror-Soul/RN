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
      // 탈퇴는 이미 성공했으므로 이후 로그아웃 처리(서버 세션 정리 실패 포함)는 performLogout이 흡수한다
      await performLogout();
      setIsConfirmSheetOpen(false);
      router.replace('/');
    } catch (error) {
      setIsConfirmSheetOpen(false);
      showToast(getErrorDisplayMessage(error, '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.'), 'error');
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
