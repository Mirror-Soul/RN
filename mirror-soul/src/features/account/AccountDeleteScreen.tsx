import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Header } from '@/src/components/common/Header';
import { ScreenLayout } from '@/src/components/common/ScreenLayout';

import { DeleteWarningSection } from './components/DeleteWarningSection';
import { DeleteConsentSection } from './components/DeleteConsentSection';
import { DeleteConfirmBottomSheet } from './components/DeleteConfirmBottomSheet';
import { deleteAccount } from '@/src/services/profileService';
import { logout as logoutApi } from '@/src/services/authService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getErrorDisplayMessage } from '@/src/utils/apiErrorCode';
import { logger } from '@/src/utils/logger';

export const AccountDeleteScreen = () => {
  const { colors } = useThemeColors();
  const router = useRouter();
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isConfirmSheetOpen, setIsConfirmSheetOpen] = useState(false);

  const toggleConsent = () => setIsConsentChecked(!isConsentChecked);

  const handleOpenConfirm = () => {
    if (!isConsentChecked) return;
    setIsConfirmSheetOpen(true);
  };

  const handleCloseConfirm = () => setIsConfirmSheetOpen(false);

  const performDeleteAccount = async () => {
    try {
      await deleteAccount();
      try {
        await logoutApi();
      } catch (error) {
        // 탈퇴는 이미 성공했으므로 서버 세션 정리 실패는 무시하고 로컬 로그아웃은 계속 진행
        logger.error('AccountDeleteScreen: /auth/logout after delete failed', error);
      }
      await useAuthStore.getState().logout();
      setIsConfirmSheetOpen(false);
      router.replace('/');
    } catch (error) {
      setIsConfirmSheetOpen(false);
      Alert.alert('회원 탈퇴 실패', getErrorDisplayMessage(error, '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.'));
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
